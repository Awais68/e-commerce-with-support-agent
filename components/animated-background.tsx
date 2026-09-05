interface AnimatedBackgroundProps {
  className?: string
}

export function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background ${className ?? ""}`}
    >
      <div
        className="animate-bg-pan absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(120deg, #f9f9f9 0%, #f6e8c8 20%, #f9f9f9 40%, #ecd9a8 60%, #f9f9f9 80%, #f2dfb3 100%)",
          backgroundSize: "300% 300%",
        }}
      />
      <div
        className="animate-blob-drift-1 absolute -top-1/4 -left-1/4 h-[65vw] w-[65vw] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(201,163,95,0.35) 0%, rgba(201,163,95,0) 70%)" }}
      />
      <div
        className="animate-blob-drift-2 absolute top-0 -right-1/4 h-[55vw] w-[55vw] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0) 70%)" }}
      />
      <div
        className="animate-blob-drift-3 absolute -bottom-1/4 left-1/3 h-[50vw] w-[50vw] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(242,223,179,0.5) 0%, rgba(242,223,179,0) 70%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_85%)]" />
    </div>
  )
}
