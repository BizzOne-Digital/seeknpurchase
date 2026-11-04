"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils";

type Point = { date: string; revenue: number; orders: number };

/** Single-series daily revenue bars (one hue, no legend — the title names it) with hover tooltip + table fallback. */
export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const W = 720, H = 220, pad = 28, bw = (W - pad) / data.length;
  const ticks = [0, 0.5, 1].map((f) => f * max);

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={() => setTable(!table)} className="text-xs font-semibold text-slate-500 underline-offset-4 hover:underline">
          {table ? "Show chart" : "Show table"}
        </button>
      </div>
      {table ? (
        <div className="max-h-60 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500"><tr><th className="py-1">Date</th><th>Orders</th><th className="text-right">Revenue</th></tr></thead>
            <tbody>{data.map((d) => <tr key={d.date} className="border-t border-line"><td className="py-1">{d.date}</td><td>{d.orders}</td><td className="text-right">{formatMoney(d.revenue)}</td></tr>)}</tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" role="img" aria-label="Daily paid revenue, last 30 days">
            {ticks.map((t) => {
              const y = H - (t / max) * (H - 10);
              return (
                <g key={t}>
                  <line x1={pad} x2={W} y1={y} y2={y} stroke="#E7E0D4" strokeWidth={1} />
                  <text x={0} y={y + 3} fontSize={9} fill="#64748b">{t >= 1000 ? `${Math.round(t / 1000)}k` : Math.round(t)}</text>
                </g>
              );
            })}
            {data.map((d, i) => {
              const h = (d.revenue / max) * (H - 10);
              const x = pad + i * bw + 1;
              return (
                <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <rect x={pad + i * bw} y={0} width={bw} height={H} fill="transparent" />
                  {h > 0 && <path d={`M${x},${H} v${-Math.max(h - 4, 0)} q0,-4 4,-4 h${Math.max(bw - 10, 1)} q4,0 4,4 v${Math.max(h - 4, 0)} z`} fill={hover === i ? "#172333" : "#B38A46"} />}
                  {i % 5 === 0 && <text x={x} y={H + 14} fontSize={9} fill="#64748b">{d.date.slice(5)}</text>}
                </g>
              );
            })}
          </svg>
          {hover !== null && (
            <div className="pointer-events-none absolute top-0 rounded-md border border-line bg-white px-3 py-2 text-xs shadow-lift" style={{ left: `${Math.min(80, ((pad + hover * bw) / W) * 100)}%` }}>
              <p className="font-semibold text-navy">{data[hover].date}</p>
              <p className="text-slate-600">{formatMoney(data[hover].revenue)} · {data[hover].orders} orders</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
