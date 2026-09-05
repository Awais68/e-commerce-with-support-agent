# Support desk integration (Next.js ↔ FastAPI)

The storefront never talks to the support backend directly. Every call goes
browser → Next route handler → FastAPI, so `SUPPORT_API_KEY` stays server-side.

## Environment

`.env.local` (git-ignored, **no `NEXT_PUBLIC_` prefix**):

```
SUPPORT_API_URL=http://localhost:8000
SUPPORT_API_KEY=test-key-12345
SUPPORT_TIMEOUT_MS=45000   # optional, see "Cold starts" below
```

On Vercel set the same two keys per environment:

```bash
vercel env add SUPPORT_API_URL production   # https://<service>.onrender.com
vercel env add SUPPORT_API_KEY production
```

## Routes

| Route | Method | Talks to | Notes |
| --- | --- | --- | --- |
| `/api/support` | POST | `POST /webhooks/webform` | Creates a ticket, returns `{ ticketNumber, trackingPath }`; passes a backend 422 through verbatim |
| `/api/support/[id]` | GET | `GET /tickets/{id}` | `force-dynamic` + `cache: "no-store"` + `Cache-Control: no-store` |
| `/api/support/chat` | POST | *(local)* | The existing AI concierge — moved here so `/api/support` could become the ticket proxy |
| `/api/internal/order-lookup` | GET | *(local DB)* | Read-only order feed for the agent's `lookup_order` tool |

The ticket GET is uncached on **both** hops. Caching it serves a customer the
thread as it looked before the agent replied — the stale-page bug.

## Pages

- `/support` — Customer Agent hub, linked from the navbar (desktop link + lifebuoy
  icon, and a "Help" block in the mobile menu). Three tabs: chat with the AI agent,
  open a ticket, track a ticket. Deep-linkable via `?tab=agent|ticket|track`.
- `/support/[ticket]` — live ticket thread, `force-dynamic`, with a refresh button.
- `/contact` — the contact form now posts to `/api/support` and shows the ticket
  number plus a link to `/support/<ticket>`.

Signed-in customers get their name and email filled from the session, and the
route handler **overrides** whatever the form posted with the session email — the
agent's identity resolution keys on that address, so it has to be the real one.

## Knowledge base seeding

An empty KB is why an agent answers generically. Seed it once the backend is up:

```bash
node scripts/seed-support-kb.mjs --dry-run   # inspect the payload
pnpm seed:kb                                 # POST /knowledge-base/ingest
```

Eight documents: returns, shipping, sizing, payments (Stripe/NayaPay/COD),
order tracking, order changes, product care, contact & escalation. Re-run it
whenever a policy page changes.

## Phase 2 — order lookup tool

`GET /api/internal/order-lookup` is already live. It authenticates with the same
`SUPPORT_API_KEY` (header `X-API-Key`, `X-Internal-Key` or `Authorization: Bearer`),
accepts `?reference=SN-XXXXXXX` or `?email=...&limit=5`, and returns status,
payment method, amount due, items, city, courier, tracking number, ETA and
timeline. It deliberately omits street address and phone.

Add this to the backend's `agent/tools.py`:

```python
import os
import httpx

ECOMMERCE_API_URL = os.environ["ECOMMERCE_API_URL"]      # https://<store>.vercel.app
ECOMMERCE_API_KEY = os.environ["ECOMMERCE_API_KEY"]      # same value as SUPPORT_API_KEY


async def lookup_order(reference: str | None = None, email: str | None = None) -> dict:
    """Look up a customer's orders by order reference (SN-XXXXXXX) or email."""
    if not reference and not email:
        return {"error": "reference or email is required"}

    params = {"reference": reference} if reference else {"email": email, "limit": "5"}
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            f"{ECOMMERCE_API_URL}/api/internal/order-lookup",
            params=params,
            headers={"X-API-Key": ECOMMERCE_API_KEY},
        )
    response.raise_for_status()
    return response.json()
```

Register it with the agent's tool list and describe it as: *"Use for any question
about where an order is, its delivery status, what was ordered, or how much is
still owed on a Cash on Delivery order."*

## Deploy

1. **Support backend → Render.** Push the FastAPI repo; `render.yaml` provisions it.
   Set `SUPPORT_API_KEY` there to the same value the storefront uses, plus
   `ECOMMERCE_API_URL` / `ECOMMERCE_API_KEY` once the tool above is wired.
2. **Storefront → Vercel.** `vercel --prod`, with `SUPPORT_API_URL` pointing at the
   Render URL (`https://<service>.onrender.com`, no trailing slash).
3. **Seed the KB against production:**
   `SUPPORT_API_URL=https://<service>.onrender.com SUPPORT_API_KEY=<key> node scripts/seed-support-kb.mjs`
4. **Smoke test:** open `/support`, submit a ticket, and confirm the ticket number
   resolves at `/support/<ticket>`.

## Cold starts (`SUPPORT_TIMEOUT_MS`)

Render's free tier sleeps after inactivity and cold-starts in roughly **30s**, so
a 15s abort turned every first-request-of-the-day into a 504 on a perfectly
healthy backend. The client now waits **45s by default** and reads the budget
from the environment:

```bash
vercel env add SUPPORT_TIMEOUT_MS production   # e.g. 60000 on free tier
```

- Read per request in `supportTimeoutMs()` (`lib/support-api.ts`), clamped to
  **1s..120s** so a typo cannot outlive the Vercel function budget.
- Unset/invalid falls back to 45 000 ms.
- On an always-on plan, drop it to `10000` to fail fast instead.
- On timeout the form gets a 504 reading *"Support service did not respond
  within 45s. It may be waking up — please try again."*, and after 8s of waiting
  `TicketForm` shows a "support desk is waking up" note so the spinner is not
  mistaken for a broken form.

## Webform contract (field names)

The webform payload keys must match the backend's Pydantic model **field for
field** — a rename on either side surfaces as an opaque 422. The shape is pinned
in `lib/support-webform-contract.json`, read by both `app/api/support/route.ts`
(dev-time drift warning) and the checker below.

| Field | | Notes |
| --- | --- | --- |
| `name` `email` `subject` `category` `priority` `message` | required | snake_case, all strings |
| `source` | extra | always `"website"` |
| `customer_id` | extra | session user id or `null` |
| `order_reference` | extra | `SN-XXXXXXX` or `null` |

The three extras are safe to send: a Pydantic model ignores unknown keys unless
it sets `extra="forbid"` — and the checker flags that case explicitly.

**Verify against the real backend, not a stub:**

```bash
pnpm check:support                                        # uses .env.local
SUPPORT_API_URL=https://<svc>.onrender.com pnpm check:support
```

It pulls the backend's own `/openapi.json`, resolves the request model for
`POST /webhooks/webform`, and exits non-zero if a required model field is never
sent, a field we send is unknown to the model, or the model forbids extras.
Run it whenever the FastAPI service is up — that is the check a stub cannot give
you. A field mismatch that slips through now returns a **422 with FastAPI's own
`msg` strings passed through** instead of a generic 502, so it is diagnosable
from the browser.
