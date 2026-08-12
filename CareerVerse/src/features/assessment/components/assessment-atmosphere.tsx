/*
 * Immersive, space-inspired backdrop for the Career Assessment. Purely
 * presentational (aria-hidden, pointer-events:none) and layered behind the flow
 * content, which stays on solid cards — readability and contrast are preserved.
 * Motion is disabled under prefers-reduced-motion via globals.css.
 */
export function AssessmentAtmosphere() {
  return (
    <div className="cv-assess" aria-hidden="true">
      <div className="cv-assess-nebula cv-assess-nebula-a" />
      <div className="cv-assess-nebula cv-assess-nebula-b" />
      <div className="cv-assess-glow" />
      <div className="cv-assess-stars" />
      <div className="cv-assess-particles">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`cv-ap cv-ap-${i % 4}`} />
        ))}
      </div>
    </div>
  );
}
