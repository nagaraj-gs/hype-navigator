import { useState } from "react";

const nodes = [
  { id: 1, x: 50, y: 45, size: 32, label: "CryptoKing", score: 94, posts: 142 },
  { id: 2, x: 22, y: 25, size: 22, label: "DegenTrader", score: 72, posts: 89 },
  { id: 3, x: 78, y: 20, size: 26, label: "WhaleAlert", score: 88, posts: 201 },
  { id: 4, x: 18, y: 72, size: 18, label: "MemeHunter", score: 65, posts: 56 },
  { id: 5, x: 80, y: 68, size: 24, label: "AlphaLeaks", score: 81, posts: 167 },
  { id: 6, x: 55, y: 18, size: 14, label: "ShibArmy", score: 45, posts: 34 },
  { id: 7, x: 35, y: 55, size: 16, label: "NFTGuru", score: 58, posts: 78 },
  { id: 8, x: 65, y: 75, size: 20, label: "PumpBot", score: 32, posts: 245 },
];

const edges = [
  [1, 2], [1, 3], [1, 5], [1, 7], [2, 4], [3, 6], [5, 8], [7, 4], [3, 5],
];

const InfluenceRadar = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="glass rounded-2xl p-6 glow-border-secondary h-full">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground">📡 Influence Radar</h3>
        <p className="text-xs text-muted-foreground mt-0.5">$PEPE influencer network</p>
      </div>

      <div className="relative h-72">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {edges.map(([a, b], i) => {
            const na = nodes.find((n) => n.id === a)!;
            const nb = nodes.find((n) => n.id === b)!;
            const isActive = hovered === a || hovered === b;
            return (
              <line
                key={i}
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={isActive ? "hsl(270, 70%, 60%)" : "hsl(228, 12%, 20%)"}
                strokeWidth={isActive ? "0.6" : "0.3"}
                strokeOpacity={isActive ? 0.8 : 0.4}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {nodes.map((n) => (
          <div
            key={n.id}
            className="absolute cursor-pointer group"
            style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%, -50%)" }}
            onMouseEnter={() => setHovered(n.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={`rounded-full flex items-center justify-center text-[9px] font-bold text-foreground transition-all duration-300 ${
                hovered === n.id ? "scale-150 glow-secondary" : ""
              }`}
              style={{
                width: n.size,
                height: n.size,
                background: `linear-gradient(135deg, hsl(217, 91%, 60%), hsl(270, 70%, 60%))`,
              }}
            >
              {n.score}
            </div>

            {hovered === n.id && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 glass-strong rounded-lg px-3 py-2 whitespace-nowrap z-20 animate-fade-in">
                <div className="text-xs font-semibold text-foreground">@{n.label}</div>
                <div className="text-[10px] text-muted-foreground">Impact: {n.score}/100</div>
                <div className="text-[10px] text-muted-foreground">{n.posts} posts</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfluenceRadar;
