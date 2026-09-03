"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

function makeGlowTexture(hex: string): THREE.Texture {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `${hex}55`)
  gradient.addColorStop(0.5, `${hex}18`)
  gradient.addColorStop(1, `${hex}00`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function GlobalBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 24)

    const gold = new THREE.Color("#c9a35f")
    const ink = new THREE.Color("#0a0a0a")

    const globeGroup = new THREE.Group()
    globeGroup.position.set(7.5, 4.5, 0)
    globeGroup.rotation.z = 0.35
    scene.add(globeGroup)

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture("#c9a35f"), transparent: true }))
    glow.scale.set(22, 22, 1)
    globeGroup.add(glow)

    const globeGeometry = new THREE.SphereGeometry(5, 28, 20)
    const globe = new THREE.LineSegments(
      new THREE.WireframeGeometry(globeGeometry),
      new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.24 }),
    )
    globeGroup.add(globe)

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(4.9, 32, 24),
      new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.05 }),
    )
    globeGroup.add(core)

    const ringConfigs = [
      { radius: 6.6, tube: 0.022, tiltX: 1.2, tiltZ: 0.1, color: gold, opacity: 0.38, speed: 0.05 },
      { radius: 7.6, tube: 0.014, tiltX: 1.35, tiltZ: -0.25, color: gold, opacity: 0.22, speed: -0.035 },
      { radius: 8.5, tube: 0.009, tiltX: 1.05, tiltZ: 0.4, color: ink, opacity: 0.16, speed: 0.025 },
    ]

    const rings = ringConfigs.map((cfg) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(cfg.radius, cfg.tube, 8, 128),
        new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: cfg.opacity }),
      )
      mesh.rotation.x = cfg.tiltX
      mesh.rotation.z = cfg.tiltZ
      globeGroup.add(mesh)
      return { mesh, speed: cfg.speed }
    })

    const sparkleAnchor = rings[0].mesh
    const sparkleAngles = [0, 1.6, 3.1, 4.5]
    const sparkleMaterial = new THREE.MeshBasicMaterial({ color: gold })
    const sparkles = sparkleAngles.map((angle) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), sparkleMaterial)
      mesh.position.set(Math.cos(angle) * ringConfigs[0].radius, Math.sin(angle) * ringConfigs[0].radius, 0)
      sparkleAnchor.add(mesh)
      return { mesh, angle }
    })

    let raf = 0
    const clock = new THREE.Clock()

    const render = () => renderer.render(scene, camera)

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05)

      globeGroup.rotation.y += delta * 0.08
      rings.forEach(({ mesh, speed }) => {
        mesh.rotation.z += delta * speed
      })
      sparkles.forEach((s) => {
        s.angle += delta * 0.3
        s.mesh.position.set(Math.cos(s.angle) * ringConfigs[0].radius, Math.sin(s.angle) * ringConfigs[0].radius, 0)
      })

      render()
      raf = requestAnimationFrame(animate)
    }

    if (reduceMotion) {
      render()
    } else {
      animate()
    }

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      const compact = width < 768
      globeGroup.scale.setScalar(compact ? 0.6 : 1)
      globeGroup.position.set(compact ? width * 0.012 : 7.5, compact ? 6 : 4.5, 0)
      render()
    }
    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", handleResize)
      globeGeometry.dispose()
      globe.geometry.dispose()
      ;(globe.material as THREE.Material).dispose()
      core.geometry.dispose()
      ;(core.material as THREE.Material).dispose()
      rings.forEach(({ mesh }) => {
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
      })
      sparkleMaterial.dispose()
      ;(glow.material as THREE.SpriteMaterial).map?.dispose()
      ;(glow.material as THREE.Material).dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div aria-hidden className="fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_0%,var(--background)_70%)]" />
    </div>
  )
}
