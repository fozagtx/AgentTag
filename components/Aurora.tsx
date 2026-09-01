export default function Aurora() {
  return (
    <div className="aurora-root" aria-hidden="true">
      <div className="aurora-blade aurora-blade-1" />
      <div className="aurora-blade aurora-blade-2" />
      <div className="aurora-blade aurora-blade-3" />
      <div className="aurora-blade aurora-blade-4" />
      <div className="aurora-vignette" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.14] mix-blend-overlay">
        <filter id="aurora-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#aurora-grain)" />
      </svg>
    </div>
  );
}
