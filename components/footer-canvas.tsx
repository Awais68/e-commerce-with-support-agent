"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function FooterCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    camera.position.z = 14

    const gold = new THREE.Color("#c9a35f")

    const COUNT = 140
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      speeds[i] = 0.002 + Math.random() * 0.006
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: gold,
      size: 0.06,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let raf = 0
    const clock = new THREE.Clock()
    let time = 0

    const animate = () => {
      const delta = clock.getDelta()
      time += delta

      const pos = geometry.attributes.position.array as Float32Array
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3 + 1] += speeds[i]
        if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = -7
      }
      geometry.attributes.position.needsUpdate = true
      points.rotation.y = Math.sin(time * 0.05) * 0.15

      material.opacity = 0.45 + Math.sin(time * 0.8) * 0.1

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }

    if (reduceMotion) {
      renderer.render(scene, camera)
    } else {
      animate()
    }

    const handleResize = () => {
      const width = container.clientWidth || 1
      const height = container.clientHeight || 1
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    handleResize()
    const observer = new ResizeObserver(handleResize)
    observer.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} aria-hidden className="pointer-events-none absolute inset-0 opacity-70" />
}