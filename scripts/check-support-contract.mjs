#!/usr/bin/env node
/**
 * Verify the webform payload against the REAL FastAPI backend, not a stub.
 *
 * Reads the backend's own /openapi.json, resolves the request model for
 * POST /webhooks/webform, and diffs its Pydantic fields against
 * lib/support-webform-contract.json. Exits non-zero on a mismatch that would
 * produce a 422 in production.
 *
 *   node scripts/check-support-contract.mjs
 *   SUPPORT_API_URL=https://<svc>.onrender.com node scripts/check-support-contract.mjs
 */

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

// Minimal .env.local reader — this script runs outside Next, so nothing loads it for us.
function loadEnvLocal() {
  let text
  try {
    text = readFileSync(resolve(root, ".env.local"), "utf8")
  } catch {
    return
  }
  for (const line of text.split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key] !== undefined) continue
    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "")
  }
}

loadEnvLocal()

const BASE = (process.env.SUPPORT_API_URL || "").replace(/\/+$/, "")
const KEY = process.env.SUPPORT_API_KEY || ""
// Cold starts on Render's free tier run ~30s; mirror the app's own default.
const TIMEOUT_MS = Number(process.env.SUPPORT_TIMEOUT_MS) > 0 ? Number(process.env.SUPPORT_TIMEOUT_MS) : 45_000

const contract = JSON.parse(readFileSync(resolve(root, "lib/support-webform-contract.json"), "utf8"))

if (!BASE) {
  console.error("SUPPORT_API_URL is not set. Add it to .env.local or pass it inline.")
  process.exit(2)
}

/** OpenAPI $ref -> the schema object it points at. */
function deref(spec, schema, seen = 0) {
  if (!schema || typeof schema !== "object" || seen > 10) return schema
  if (typeof schema.$ref === "string") {
    const path = schema.$ref.replace(/^#\//, "").split("/")
    let node = spec
    for (const segment of path) node = node?.[segment]
    return deref(spec, node, seen + 1)
  }
  // Optional fields land as anyOf: [{type}, {type: "null"}].
  if (Array.isArray(schema.allOf) && schema.allOf.length === 1) return deref(spec, schema.allOf[0], seen + 1)
  return schema
}

async function main() {
  const url = `${BASE}/openapi.json`
  console.log(`→ GET ${url}`)

  let response
  try {
    response = await fetch(url, {
      headers: KEY ? { "X-API-Key": KEY, Authorization: `Bearer ${KEY}` } : {},
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    console.error(`\n✖ Could not reach the backend (${error?.name === "TimeoutError" ? `no response in ${TIMEOUT_MS}ms` : error?.message}).`)
    console.error("  Start the FastAPI service (uvicorn main:app --port 8000) or point SUPPORT_API_URL at the deployed one, then re-run.")
    process.exit(2)
  }

  if (!response.ok) {
    console.error(`\n✖ ${url} returned ${response.status}. Is the docs/OpenAPI route exposed?`)
    process.exit(2)
  }

  const spec = await response.json()
  const path = spec.paths?.[contract.endpoint]
  if (!path) {
    console.error(`\n✖ The backend has no ${contract.endpoint} path. Available:`)
    for (const key of Object.keys(spec.paths ?? {})) console.error(`    ${key}`)
    process.exit(1)
  }

  const operation = path[contract.method.toLowerCase()]
  if (!operation) {
    console.error(`\n✖ ${contract.endpoint} exists but has no ${contract.method}. Methods: ${Object.keys(path).join(", ")}`)
    process.exit(1)
  }

  const bodySchema = deref(spec, operation.requestBody?.content?.["application/json"]?.schema)
  if (!bodySchema?.properties) {
    console.error(`\n✖ ${contract.method} ${contract.endpoint} declares no JSON request body schema.`)
    process.exit(1)
  }

  const modelFields = Object.keys(bodySchema.properties)
  const modelRequired = new Set(bodySchema.required ?? [])
  const forbidsExtra = bodySchema.additionalProperties === false

  const ourFields = Object.keys(contract.fields)
  const ourRequired = ourFields.filter((name) => contract.fields[name].kind === "required")

  console.log(`\nBackend model: ${bodySchema.title ?? "(untitled)"}`)
  console.log(`  fields   : ${modelFields.join(", ") || "(none)"}`)
  console.log(`  required : ${[...modelRequired].join(", ") || "(none)"}`)
  console.log(`  extra    : ${forbidsExtra ? "FORBIDDEN (extra=forbid)" : "ignored"}`)

  // One entry per field, so a single rename does not print three variants of
  // the same problem.
  const problems = new Map()

  // Anything the model requires that we never send is a guaranteed 422.
  for (const field of modelRequired) {
    if (!ourFields.includes(field)) {
      problems.set(field, `the model requires "${field}", the storefront never sends it`)
    }
  }

  for (const field of ourFields) {
    if (modelFields.includes(field)) continue
    const required = ourRequired.includes(field)
    if (forbidsExtra) {
      problems.set(field, `we send "${field}" but the model has no such field and sets extra="forbid" — rejected`)
    } else if (required) {
      problems.set(field, `we send "${field}" as a required value but the model has no such field — it is silently dropped`)
    }
  }

  const unusedExtras = ourFields.filter((f) => contract.fields[f].kind === "extra" && !modelFields.includes(f))

  console.log("")
  if (problems.size) {
    console.error("✖ Contract mismatch — this would 422 in production:")
    for (const problem of problems.values()) console.error(`    • ${problem}`)
    console.error("\n  Fix lib/support-webform-contract.json + app/api/support/route.ts, or the Pydantic model.")
    process.exit(1)
  }

  console.log("✔ Every field the backend requires is sent, with matching names.")
  if (unusedExtras.length) {
    console.log(`  (Ignored by the backend, harmless: ${unusedExtras.join(", ")})`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(2)
})
