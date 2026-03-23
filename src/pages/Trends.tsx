import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, Flame, Eye, MessageSquare } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import TopBar from "@/components/dashboard/TopBar";

const trendData = [
  { time: "Mon", mentions: 1200, sentiment: 68, volume: 8500 },
  { time: "Tue", mentions: 1800, sentiment: 72, volume: 12000 },
  { time: "Wed", mentions: 2400, sentiment: 65, volume: 15000 },
  { time: "Thu", mentions: 3100, sentiment: 58, volume: 22000 },
  { time: "Fri", mentions: 4500, sentiment: 45, volume: 35000 },
  { time: "Sat", mentions: 3800, sentiment: 52, volume: 28000 },
  { time: "Sun", mentions: 2900, sentiment: 61, volume: 19000 },
];

const platformData = [
  { platform: "Twitter/X", posts: 4200, change: 24 },
  { platform: "Reddit", posts: 1800, change: -8 },
  { platform: "Telegram", posts: 3100, change: 42 },
  { platform: "Discord", posts: 2400, change: 15 },
  { platform: "YouTube", posts: 890, change: 67 },
];

const sentimentPie = [
  { name: "Bullish", value: 45, color: "hsl(142, 71%, 45%)" },
  { name: "Neutral", value: 30, color: "hsl(215, 20%, 55%)" },
  { name: "Bearish", value: 25, color: "hsl(0, 72%, 51%)" },
];

const trendingCoins = [
  { name: "DOGE", symbol: "$DOGE", mentions: 12400, change: 34, hype: 82, sentiment: "bullish" },
  { name: "PEPE", symbol: "$PEPE", mentions: 9800, change: 67, hype: 91, sentiment: "bullish" },
  { name: "SHIB", symbol: "$SHIB", mentions: 7200, change: -12, hype: 45, sentiment: "bearish" },
  { name: "WIF", symbol: "$WIF", mentions: 5600, change: 89, hype: 78, sentiment: "bullish" },
  { name: "BONK", symbol: "$BONK", mentions: 4300, change: -28, hype: 33, sentiment: "bearish" },
  { name: "FLOKI", symbol: "$FLOKI", mentions: 3800, change: 15, hype: 62, sentiment: "neutral" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg p-3 text-xs space-y-1">
      <div className="font-semibold text-foreground">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</div>
      ))}
    </div>
  );
};

const Trends = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeFilter, setTimeFilter] = useState("7d");
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar search={search} onSearchChange={setSearch} timeFilter={timeFilter} onTimeFilterChange={setTimeFilter} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Mentions", value: "48.2K", change: "+24%", icon: MessageSquare, color: "text-primary" },
              { label: "Trending Coins", value: "127", change: "+12", icon: Flame, color: "text-warning" },
              { label: "Avg Sentiment", value: "62%", change: "-3%", icon: Eye, color: "text-secondary" },
              { label: "Volume Spikes", value: "8", change: "+5", icon: TrendingUp, color: "text-success" },
            ].map((s) => (
              <div key={s.label} className="metric-card group">
                <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</span>
                  <span className={`text-xs font-mono ${s.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{s.change}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Main trend chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 glow-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">📈 Trend Overview</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Social mentions & sentiment across all platforms</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Mentions</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" />Sentiment</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" />Volume</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="tMentions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 16%)" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="mentions" name="Mentions" stroke="hsl(217, 91%, 60%)" fill="url(#tMentions)" strokeWidth={2} />
                <Area type="monotone" dataKey="volume" name="Volume" stroke="hsl(142, 71%, 45%)" fill="url(#tVolume)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Platform breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 glow-border-secondary">
              <h3 className="text-sm font-semibold text-foreground mb-1">🌐 Platform Breakdown</h3>
              <p className="text-xs text-muted-foreground mb-5">Posts per platform this week</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 16%)" />
                  <XAxis dataKey="platform" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="posts" name="Posts" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Sentiment distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 glow-border">
              <h3 className="text-sm font-semibold text-foreground mb-1">🧠 Sentiment Distribution</h3>
              <p className="text-xs text-muted-foreground mb-5">Market mood across all coins</p>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={sentimentPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                      {sentimentPie.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {sentimentPie.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-muted-foreground">{s.name} {s.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Trending coins table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-6 glow-border">
            <h3 className="text-sm font-semibold text-foreground mb-1">🔥 Trending Coins</h3>
            <p className="text-xs text-muted-foreground mb-5">Top coins by social activity this week</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Coin</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Mentions</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Change</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Hype Score</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingCoins.map((coin) => (
                    <tr key={coin.symbol} className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-foreground glow-primary">
                            {coin.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{coin.name}</div>
                            <div className="text-muted-foreground font-mono">{coin.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 font-mono text-foreground">{coin.mentions.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">
                        <span className={`inline-flex items-center gap-1 font-mono ${coin.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {coin.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(coin.change)}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${coin.hype}%` }} />
                          </div>
                          <span className="font-mono text-foreground w-6 text-right">{coin.hype}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          coin.sentiment === 'bullish' ? 'bg-success/10 text-success' :
                          coin.sentiment === 'bearish' ? 'bg-destructive/10 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {coin.sentiment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Trends;
