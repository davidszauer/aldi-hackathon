"use client";

import { iconFor, deptFor } from "@/lib/routeIcons";

// ----- ALDI brand palette -----
export const ALDI = {
  navy: "#001E5A",
  blue: "#009FE3",
  lightBlue: "#B3DCF4",
  orange: "#F39200",
  red: "#E2001A",
  floor: "#E9EFF5",
  floorLine: "#D7E1EC",
  shelfTop: "#FFFFFF",
  shelfTopEdge: "#D6DEE7",
  shelfFront: "#C3CDD8",
  shelfFrontDark: "#A9B5C3",
};

export type ShelfState = "idle" | "target" | "done" | "muted";

// Darken a #rrggbb hex by amt (0..1).
function darken(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - amt));
  const g = Math.round(((n >> 8) & 255) * (1 - amt));
  const b = Math.round((n & 255) * (1 - amt));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// Tops of stocked products seen from above — a tidy 3×2 grid of little boxes
// tinted with the department accent.
function products(w: number, topH: number, accent: string) {
  const cols = 3;
  const rows = 2;
  const x0 = 7;
  const y0 = 20;
  const gx = 4;
  const gy = 4;
  const pw = (w - x0 * 2 - gx * (cols - 1)) / cols;
  const ph = (topH - y0 - 7 - gy * (rows - 1)) / rows;
  const ops = [0.85, 0.55, 0.72, 0.5, 0.8, 0.62];
  const out = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (pw + gx);
      const y = y0 + r * (ph + gy);
      out.push(
        <g key={`${r}-${c}`}>
          <rect
            x={x}
            y={y}
            width={pw}
            height={ph}
            rx={2}
            fill={accent}
            opacity={ops[i % ops.length]}
          />
          <rect x={x} y={y} width={pw} height={2} rx={1} fill="#ffffff" opacity={0.5} />
        </g>,
      );
      i++;
    }
  }
  return out;
}

export function Shelf({
  w,
  topH,
  front,
  categoryId,
  stopNo,
  state,
}: {
  w: number;
  topH: number;
  front: number;
  categoryId?: number | null;
  stopNo?: number;
  state: ShelfState;
}) {
  const H = topH + front;
  const r = 8;
  const dept = deptFor(categoryId);

  // Colour the whole shelf by its department; grey it out when muted.
  let topFill = dept.face;
  let frontFill = darken(dept.face, 0.16);
  let frontDark = darken(dept.face, 0.28);
  let signFill = dept.sign;
  let accent = dept.sign; // product tint
  let bodyOpacity = 1;
  if (state === "done") {
    topFill = "#ecfdf3";
    frontFill = "#9fcfb4";
    frontDark = "#7fbd9c";
    signFill = "#10b981";
    accent = "#34d399";
  } else if (state === "muted") {
    topFill = "#EAEDF1";
    frontFill = "#D2D8E0";
    frontDark = "#BCC4CF";
    signFill = "#AEB8C4";
    accent = "#AEB8C4";
    bodyOpacity = 0.6;
  }

  return (
    <svg
      width={w}
      height={H}
      viewBox={`0 0 ${w} ${H}`}
      style={{ overflow: "visible", opacity: bodyOpacity }}
    >
      {state === "target" && (
        <rect
          x={-3}
          y={-3}
          width={w + 6}
          height={H + 6}
          rx={11}
          fill="none"
          stroke={accent}
          strokeWidth={3}
          opacity={0.9}
        >
          <animate
            attributeName="opacity"
            values="0.35;1;0.35"
            dur="1.1s"
            repeatCount="indefinite"
          />
        </rect>
      )}

      {/* front face (height) */}
      <path
        d={`M0 ${topH} H${w} V${H - r} a${r} ${r} 0 0 1 -${r} ${r} H${r} a${r} ${r} 0 0 1 -${r} -${r} Z`}
        fill={frontFill}
      />
      <rect x={0} y={H - 4} width={w} height={4} fill={frontDark} opacity={0.6} />

      {/* top face */}
      <rect x={0} y={0} width={w} height={topH} rx={r} fill={topFill} stroke={ALDI.shelfTopEdge} />

      {/* department sign band (rounded top only) */}
      <path
        d={`M${r} 0 H${w - r} a${r} ${r} 0 0 1 ${r} ${r} V16 H0 V${r} a${r} ${r} 0 0 1 ${r} -${r} Z`}
        fill={signFill}
      />
      <text
        x={stopNo != null ? 13 : w / 2}
        y={8.5}
        fontSize={11}
        textAnchor={stopNo != null ? "start" : "middle"}
        dominantBaseline="central"
      >
        {iconFor(categoryId)}
      </text>

      {/* products on the shelf top */}
      {products(w, topH, accent)}

      {/* pickup stop number */}
      {stopNo != null && (
        <g>
          <circle cx={w - 11} cy={8} r={7.5} fill="#ffffff" stroke={accent} strokeWidth={1.5} />
          <text
            x={w - 11}
            y={8.5}
            fontSize={9}
            fontWeight={800}
            fill={accent}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {stopNo}
          </text>
        </g>
      )}

      {/* collected check */}
      {state === "done" && (
        <g>
          <circle cx={w - 9} cy={topH - 9} r={9} fill="#10b981" stroke="#fff" strokeWidth={2} />
          <path
            d={`M${w - 13} ${topH - 9} l3 3 l5 -6`}
            stroke="#fff"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
}

export function EntranceDoor({ w, topH, front }: { w: number; topH: number; front: number }) {
  const H = topH + front;
  const r = 8;
  return (
    <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} style={{ overflow: "visible" }}>
      <path
        d={`M0 ${topH} H${w} V${H - r} a${r} ${r} 0 0 1 -${r} ${r} H${r} a${r} ${r} 0 0 1 -${r} -${r} Z`}
        fill={ALDI.navy}
        opacity={0.85}
      />
      <rect x={0} y={0} width={w} height={topH} rx={r} fill={ALDI.navy} />
      {/* glass panels */}
      <rect
        x={6}
        y={8}
        width={(w - 16) / 2}
        height={topH - 16}
        rx={3}
        fill={ALDI.lightBlue}
        opacity={0.9}
      />
      <rect
        x={w / 2 + 2}
        y={8}
        width={(w - 16) / 2}
        height={topH - 16}
        rx={3}
        fill={ALDI.lightBlue}
        opacity={0.9}
      />
      {/* opening arrows */}
      <path
        d={`M${w / 2 - 9} ${topH / 2} h6 m0 -4 l4 4 l-4 4`}
        stroke="#fff"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      <text x={w / 2} y={topH - 1} fontSize={8} fontWeight={800} fill="#fff" textAnchor="middle">
        IN
      </text>
    </svg>
  );
}

export function CheckoutTill({ w, topH, front }: { w: number; topH: number; front: number }) {
  const H = topH + front;
  const r = 8;
  return (
    <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} style={{ overflow: "visible" }}>
      <path
        d={`M0 ${topH} H${w} V${H - r} a${r} ${r} 0 0 1 -${r} ${r} H${r} a${r} ${r} 0 0 1 -${r} -${r} Z`}
        fill={ALDI.red}
        opacity={0.8}
      />
      <rect x={0} y={0} width={w} height={topH} rx={r} fill={ALDI.red} />
      {/* conveyor belt */}
      <rect x={6} y={10} width={w - 12} height={14} rx={3} fill="#2b2b2b" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={10 + i * ((w - 20) / 4)}
          y={13}
          width={(w - 28) / 4}
          height={8}
          rx={1.5}
          fill="#555"
        />
      ))}
      {/* register */}
      <rect x={w / 2 - 8} y={topH - 20} width={16} height={13} rx={2} fill={ALDI.navy} />
      <rect x={w / 2 - 5} y={topH - 17} width={10} height={5} rx={1} fill={ALDI.lightBlue} />
      <text x={w / 2} y={topH - 1} fontSize={8} fontWeight={800} fill="#fff" textAnchor="middle">
        PAY
      </text>
    </svg>
  );
}
