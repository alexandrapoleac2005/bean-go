// Fixed film-grain overlay over the whole app: fractal noise at very low opacity,
// multiplied into the warm palette so flat fills read as paper. Pointer-transparent,
// hidden from assistive tech, and dropped in forced-colors / print (see index.css).
export function Grain() {
  return (
    <svg className="grain" aria-hidden focusable="false">
      <filter id="bean-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#bean-grain)" />
    </svg>
  )
}
