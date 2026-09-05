"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface ParticleCanvasProps {
  color?: string
  count?: number
  size?: number
  opacity?: number
  className?: string
}

export function ParticleCanvas({
  color = "#c9a35f",
  count = 90,
  size = 0.05,
  opacity = 0.4,
  className,
}: ParticleCanvasProps) {
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
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
    camera.position.z = 16

    const tint = new THREE.Color(color)

    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      speeds[i] = 0.0015 + Math.random() * 0.0045
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: tint,
      size,
      transparent: true,
      opacity,
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
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += speeds[i]
        if (pos[i * 3 + 1] > 8) pos[i * 3 + 1] = -8
      }
      geometry.attributes.position.needsUpdate = true
      points.rotation.y = Math.sin(time * 0.04) * 0.12

      material.opacity = opacity + Math.sin(time * 0.6) * (opacity * 0.2)

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
  }, [color, count, size, opacity])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
    />
  )
}
