import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api";

type RadarNode = {
  id: number;
  x: number;
  y: number;
  size: number;
  handle: string;
  impact_score: number;
  posts_24h: number;
};

const fallbackNodes: RadarNode[] = [
  { id: 1, x: 50, y: 45, size: 32, handle: "CryptoKing", impact_score: 94, posts_24h: 142 },
  { id: 2, x: 22, y: 25, size: 22, handle: "DegenTrader", impact_score: 72, posts_24h: 89 },
  { id: 3, x: 78, y: 20, size: 26, handle: "WhaleAlert", impact_score: 88, posts_24h: 201 },
  { id: 4, x: 18, y: 72, size: 18, handle: "MemeHunter", impact_score: 65, posts_24h: 56 },
  { id: 5, x: 80, y: 68, size: 24, handle: "AlphaLeaks", impact_score: 81, posts_24h: 167 },
];

const InfluenceRadar = () => {
  const [nodes, setNodes] = useState<RadarNode[]>(fallbackNodes);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const payload = await fetchJson<RadarNode[]>("/influence/radar");
        if (mounted && payload.length > 0) {
          setNodes(payload);
        }
      } catch {
        // Keep fallback nodes when backend is unavailable.
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const edges = useMemo(() => {
    if (nodes.length < 2) return [] as number[][];
    const center = nodes[0].id;
    const starEdges = nodes.slice(1).map((node) => [center, node.id]);
    const chainEdges = nodes.slice(1).map((node, index) => {
      if (index === 0) return null;
      return [nodes[index].id, node.id];
    }).filter((edge): edge is number[] => edge !== null);
    return [...starEdges, ...chainEdges];
  }, [nodes]);

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
                <div className="text-xs font-semibold text-foreground">@{n.handle}</div>
                <div className="text-[10px] text-muted-foreground">Impact: {n.impact_score}/100</div>
                <div className="text-[10px] text-muted-foreground">{n.posts_24h} posts</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfluenceRadar;
