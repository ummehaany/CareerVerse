"use client";

import { useEffect, useRef } from "react";

/*
 * CareerVerse cosmic identity — a subtle, professional "exploring a universe"
 * backdrop: soft nebula gradients, a twinkling star field, drifting particles,
 * faint constellations, an ambient glow, and gentle mouse parallax.
 *
 * Everything is presentational (aria-hidden, pointer-events:none) and sits on a
 * solid --surface base so content readability is unchanged. Motion is disabled
 * under prefers-reduced-motion and parallax only runs for fine pointers.
 */
export function CosmicBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window.matchMedia !== "function") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    if (reduce.matches || !fine.matches) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.setProperty("--px", cx.toFixed(4));
      el.style.setProperty("--py", cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    const onMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cv-cosmos" aria-hidden="true">
      <div className="cv-cosmos-nebula" />
      <div className="cv-cosmos-glow cv-cosmos-glow-a" />
      <div className="cv-cosmos-glow cv-cosmos-glow-b" />
      <div className="cv-cosmos-stars cv-cosmos-stars-1" />
      <div className="cv-cosmos-stars cv-cosmos-stars-2" />
      <div className="cv-cosmos-stars cv-cosmos-stars-3" />
      <svg className="cv-cosmos-lines" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <g stroke="currentColor" strokeWidth="0.6" fill="none">
          <polyline points="120,180 220,120 300,220 420,160" />
          <polyline points="760,140 840,220 800,340 700,300" />
          <polyline points="180,720 260,800 400,760 460,860" />
          <polyline points="640,640 740,700 820,640 900,720" />
        </g>
        <g fill="currentColor">
          {[
            [120, 180], [220, 120], [300, 220], [420, 160],
            [760, 140], [840, 220], [800, 340], [700, 300],
            [180, 720], [260, 800], [400, 760], [460, 860],
            [640, 640], [740, 700], [820, 640], [900, 720],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.2" />
          ))}
        </g>
      </svg>
      <div className="cv-cosmos-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={`cv-particle cv-particle-${i % 6}`} />
        ))}
      </div>
    </div>
  );
}
