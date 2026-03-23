import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Clock, TrendingUp, Flame, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import TopBar from "@/components/dashboard/TopBar";

const coins = [
  { id: "doge", name: "DOGE", symbol: "$DOGE" },
  { id: "pepe", name: "PEPE", symbol: "$PEPE" },
  { id: "shib", name: "SHIB", symbol: "$SHIB" },
  { id: "wif", name: "WIF", symbol: "$WIF" },
];

const generateData = (seed: number) =>
  Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    hype: Math.round(20 + Math.sin(i * 0.3 + seed) * 30 + Math.random() * 25),
    mentions: Math.round(500 + Math.sin(i * 0.2 + seed) * 400 + Math.random() * 300),
    sentiment: Math.round(40 + Math.cos(i * 0.25 + seed) * 25 + Math.random() * 10),
  }));

const coinData: Record<string, ReturnType<typeof generateData>> = {
  doge: generateData(1),
  pepe: generateData(2.5),
  shib: generateData(4),
  wif: generateData(5.5),
};

const events = [
  { day: 5, label: "Elon tweet", type: "viral" },
  { day: 12, label: "Exchange listing", type: "catalyst" },
  { day: 18, label: "Whale dump", type: "danger" },
  { day: 24, label: "Community AMA", type: "organic" },
];

const eventColors: Record<string, string> = {
  viral: "bg-primary text-primary-foreground",
  catalyst: "bg-success text-success-foreground",
  danger: "bg-destructive text-destructive-foreground",
  organic: "bg-secondary text-secondary-foreground",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg p-3 text-xs space-y-1">
      <div className="font-semibold text-foreground">Day {label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

const Replay = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeFilter, setTimeFilter] = useState("30d");
  const [search, setSearch] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("doge");
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [speed, setSpeed] = useState(400);

  const data = coinData[selectedCoin];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setPosition((prev) => {
          if (prev >= data.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, data.length]);

  const visibleData = data.slice(0, position + 1);
  const current = data[position];
  const peakHype = Math.max(...data.map(d => d.hype));
  const activeEvents = events.filter(e => e.day <= position + 1);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar search={search} onSearchChange={setSearch} timeFilter={timeFilter} onTimeFilterChange={setTimeFilter} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header with coin selector */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">⏳ Hype Replay</h2>
              <p className="text-xs text-muted-foreground">Replay how hype evolved over time</p>
            </div>
            <div className="flex items-center gap-2">
              {coins.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCoin(c.id); setPosition(0); setPlaying(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCoin === c.id ? "bg-primary/20 text-primary glow-border" : "text-muted-foreground hover:text-foreground bg-muted/30"
                  }`}
                >
                  {c.symbol}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Live stats row */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Current Hype", value: `${current.hype}%`, icon: Flame, color: current.hype === peakHype ? "text-warning" : "text-primary" },
              { label: "Mentions", value: current.mentions.toLocaleString(), icon: BarChart3, color: "text-secondary" },
              { label: "Sentiment", value: `${current.sentiment}%`, icon: TrendingUp, color: current.sentiment > 60 ? "text-success" : "text-warning" },
              { label: "Day", value: `${position + 1} / ${data.length}`, icon: Clock, color: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="metric-card">
                <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <span className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Main replay chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 glow-border">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={visibleData}>
                <defs>
                  <linearGradient id="rHype" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rMentions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 16%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="hype" name="Hype" stroke="hsl(217, 91%, 60%)" fill="url(#rHype)" strokeWidth={2} />
                <Area type="monotone" dataKey="mentions" name="Mentions" stroke="hsl(270, 70%, 60%)" fill="url(#rMentions)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Controls */}
            <div className="mt-4 space-y-3">
              <input
                type="range" min={0} max={data.length - 1} value={position}
                onChange={(e) => { setPosition(Number(e.target.value)); setPlaying(false); }}
                className="w-full h-1 appearance-none bg-muted rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex items-center justify-center gap-3">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setPosition(0); setPlaying(false); }}>
                  <SkipBack className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-10 h-10 glow-border rounded-full" onClick={() => { if (position >= data.length - 1) setPosition(0); setPlaying(!playing); }}>
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setPosition(data.length - 1); setPlaying(false); }}>
                  <SkipForward className="w-3.5 h-3.5" />
                </Button>
                <div className="ml-4 flex items-center gap-2">
                  {[200, 400, 800].map((s) => (
                    <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-0.5 rounded text-[10px] font-mono ${speed === s ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                      {s === 200 ? '2x' : s === 400 ? '1x' : '0.5x'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline bars + events */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 glow-border-secondary">
              <h3 className="text-sm font-semibold text-foreground mb-1">📊 Daily Hype Bars</h3>
              <p className="text-xs text-muted-foreground mb-5">Visual timeline of hype intensity</p>
              <div className="h-40 flex items-end gap-[3px]">
                {data.map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all duration-300 cursor-pointer relative group"
                    onClick={() => { setPosition(i); setPlaying(false); }}
                    style={{
                      height: `${d.hype}%`,
                      background: i <= position
                        ? i === position ? "linear-gradient(to top, hsl(270, 70%, 60%), hsl(217, 91%, 60%))" : "linear-gradient(to top, hsl(217, 91%, 60%), hsl(270, 70%, 60%))"
                        : "hsl(228, 12%, 14%)",
                      opacity: i <= position ? 1 : 0.25,
                      boxShadow: i === position ? "0 0 12px hsla(217, 91%, 60%, 0.5)" : "none",
                    }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 glass-strong rounded px-1.5 py-0.5 text-[9px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Day {i + 1}: {d.hype}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 glow-border">
              <h3 className="text-sm font-semibold text-foreground mb-1">📌 Key Events</h3>
              <p className="text-xs text-muted-foreground mb-5">Significant moments in this cycle</p>
              <div className="space-y-3">
                {events.map((e, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-border transition-all ${e.day <= position + 1 ? 'opacity-100' : 'opacity-30'}`}
                  >
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${eventColors[e.type]}`}>Day {e.day}</span>
                    <span className="text-xs text-foreground flex-1">{e.label}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${eventColors[e.type]}`}>{e.type}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Replay;
