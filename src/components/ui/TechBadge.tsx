"use client";

import { useEffect, useRef, useState } from "react";
import { toneStyles, type Technology } from "@/lib/data";
import { cn } from "@/lib/cn";

type Props = {
  tech: Technology;
  size?: number;
  className?: string;
};

/**
 * Shows the technology's official logo from /public/logos/<slug>.svg.
 * Until that file exists, it falls back to a short text badge (e.g. "K8s").
 * Download official logos from each project's brand / press page and follow
 * their trademark guidelines.
 */
export function TechBadge({ tech, size = 52, className }: Props) {
  const [logoMissing, setLogoMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const tone = toneStyles[tech.tone];

  // The image may have failed before React hydrated and attached onError.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setLogoMissing(true);
  }, []);

  return (
    <span
      className={cn(
        "gl-ico flex shrink-0 items-center justify-center rounded-xl border font-mono font-medium",
        tone.text,
        tone.bg,
        tone.border,
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.29) }}
    >
      {logoMissing ? (
        tech.short
      ) : (
        // Plain <img> so a missing file can fall back gracefully.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={`/logos/${tech.slug}.svg`}
          alt=""
          width={Math.round(size * 0.6)}
          height={Math.round(size * 0.6)}
          onError={() => setLogoMissing(true)}
          className="object-contain"
        />
      )}
      <span className="sr-only">{tech.name}</span>
    </span>
  );
}
