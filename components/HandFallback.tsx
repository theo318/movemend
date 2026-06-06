import type { FingerId } from "@/lib/types";

const SKIN = "#e7b48f";
const RED = "#ef4444";

/**
 * 2D SVG hand shown when WebGL is unavailable (or the canvas errors). Still
 * highlights the affected finger so the guidance is never lost.
 */
export default function HandFallback({ finger }: { finger: FingerId | null }) {
  const fill = (id: FingerId) => (finger === id ? RED : SKIN);
  const glow = (id: FingerId) =>
    finger === id ? { filter: "drop-shadow(0 0 6px rgba(239,68,68,0.9))" } : undefined;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6">
      <svg viewBox="0 0 200 250" className="h-[78%] w-auto" role="img" aria-label="Hand model">
        {/* Palm + wrist */}
        <rect x="52" y="120" width="96" height="96" rx="34" fill={SKIN} />
        <rect x="70" y="200" width="60" height="40" rx="18" fill="#d99e76" />
        {/* Fingers */}
        <rect x="58" y="58" width="19" height="74" rx="9.5" fill={fill("index")} style={glow("index")} />
        <rect x="82" y="44" width="19" height="88" rx="9.5" fill={fill("middle")} style={glow("middle")} />
        <rect x="106" y="54" width="19" height="78" rx="9.5" fill={fill("ring")} style={glow("ring")} />
        <rect x="129" y="72" width="16" height="62" rx="8" fill={fill("little")} style={glow("little")} />
        {/* Thumb */}
        <rect
          x="30"
          y="120"
          width="18"
          height="60"
          rx="9"
          fill={fill("thumb")}
          style={glow("thumb")}
          transform="rotate(40 39 150)"
        />
      </svg>
      <p className="text-center text-xs text-slate-300">
        {finger ? `${cap(finger)} finger highlighted` : "Hand model"} · 2D view (WebGL unavailable)
      </p>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
