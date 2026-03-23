import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchJson } from "@/lib/api";

const fallbackData = [
  { time: "00:00", mentions: 120, sentiment: 65 },
  { time: "03:00", mentions: 95, sentiment: 60 },
  { time: "06:00", mentions: 140, sentiment: 70 },
  { time: "09:00", mentions: 280, sentiment: 75 },
  { time: "12:00", mentions: 450, sentiment: 55 },
  { time: "15:00", mentions: 380, sentiment: 50 },
  { time: "18:00", mentions: 520, sentiment: 40 },
  { time: "21:00", mentions: 410, sentiment: 62 },
  { time: "Now", mentions: 350, sentiment: 68 },
];

type TrendPoint = {
  ts: string;
  mentions: number;
  sentiment: number;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg p-3 text-xs space-y-1">
      <div className="font-semibold text-foreground">{label}</div>
      <div className="text-primary">Mentions: {payload[0]?.value}</div>
      <div className="text-secondary">Sentiment: {payload[1]?.value}%</div>
    </div>
  );
};

const TrendChart = () => {
  const [data, setData] = useState(fallbackData);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const payload = await fetchJson<TrendPoint[]>("/dashboard/trend-chart?symbol=DOGE&limit=20");
        if (!mounted || payload.length === 0) return;

        const mapped = payload
          .slice()
          .reverse()
          .map((point) => ({
            time: new Date(point.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            mentions: point.mentions,
            sentiment: point.sentiment,
          }));

        setData(mapped);
      } catch {
        // Keep fallback chart when backend is unavailable.
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="glass rounded-2xl p-6 glow-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Trend Analytics</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Mentions & sentiment over time</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Mentions</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" />Sentiment</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="mentionsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 16%)" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="mentions" stroke="hsl(217, 91%, 60%)" fill="url(#mentionsGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="sentiment" stroke="hsl(270, 70%, 60%)" fill="url(#sentimentGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
