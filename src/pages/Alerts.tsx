import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Zap, ShieldAlert, Bell, BellOff, CheckCircle, XCircle, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import TopBar from "@/components/dashboard/TopBar";

const alertHistory = [
  { day: "Mon", critical: 3, warning: 8, info: 12 },
  { day: "Tue", critical: 1, warning: 5, info: 9 },
  { day: "Wed", critical: 5, warning: 12, info: 15 },
  { day: "Thu", critical: 8, warning: 15, info: 20 },
  { day: "Fri", critical: 4, warning: 9, info: 11 },
  { day: "Sat", critical: 2, warning: 6, info: 8 },
  { day: "Sun", critical: 6, warning: 11, info: 14 },
];

const riskTrend = [
  { time: "00:00", risk: 42 }, { time: "04:00", risk: 38 }, { time: "08:00", risk: 55 },
  { time: "12:00", risk: 78 }, { time: "16:00", risk: 65 }, { time: "20:00", risk: 71 }, { time: "Now", risk: 58 },
];

type AlertType = { type: string; icon: any; title: string; coin: string; message: string; time: string; severity: string; status: string };

const allAlerts: AlertType[] = [
  { type: "danger", icon: AlertTriangle, title: "Pump Detected", coin: "$SHIB", message: "Volume spike of 340% in 2h with coordinated social activity", time: "2 min ago", severity: "critical", status: "active" },
  { type: "danger", icon: ShieldAlert, title: "Wash Trading", coin: "$PEPE", message: "Suspicious circular trading pattern detected across 12 wallets", time: "5 min ago", severity: "critical", status: "active" },
  { type: "warning", icon: TrendingUp, title: "Unusual Spike", coin: "$PEPE", message: "Mentions increased 180% — 67% from new accounts", time: "14 min ago", severity: "high", status: "active" },
  { type: "danger", icon: AlertTriangle, title: "High Risk Coin", coin: "$BONK", message: "Trust score dropped to 23. Multiple red flags detected.", time: "28 min ago", severity: "critical", status: "investigating" },
  { type: "warning", icon: TrendingUp, title: "Bot Activity", coin: "$WIF", message: "42% of recent mentions originate from bot accounts", time: "35 min ago", severity: "high", status: "active" },
  { type: "info", icon: Zap, title: "New Trend", coin: "$WIF", message: "Emerging trend detected — organic growth pattern confirmed", time: "45 min ago", severity: "low", status: "resolved" },
  { type: "warning", icon: AlertTriangle, title: "Whale Alert", coin: "$DOGE", message: "Large holder moved 500M tokens to exchange wallet", time: "1h ago", severity: "high", status: "active" },
  { type: "info", icon: Zap, title: "Sentiment Shift", coin: "$FLOKI", message: "Sentiment flipped from bearish to bullish in 30 minutes", time: "1.5h ago", severity: "medium", status: "resolved" },
  { type: "danger", icon: ShieldAlert, title: "Rug Pull Risk", coin: "$LUNA2", message: "Liquidity dropped 89% — dev wallet activity detected", time: "2h ago", severity: "critical", status: "investigating" },
  { type: "info", icon: Zap, title: "Organic Growth", coin: "$PEPE", message: "Steady 15% daily growth with diverse account sources", time: "3h ago", severity: "low", status: "resolved" },
];

const colorMap: Record<string, string> = {
  danger: "border-destructive/30 bg-destructive/5",
  warning: "border-warning/30 bg-warning/5",
  info: "border-primary/30 bg-primary/5",
};
const iconColorMap: Record<string, string> = {
  danger: "text-destructive",
  warning: "text-warning",
  info: "text-primary",
};
const statusColors: Record<string, string> = {
  active: "bg-destructive/10 text-destructive",
  investigating: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg p-3 text-xs space-y-1">
      <div className="font-semibold text-foreground">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

const Alerts = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeFilter, setTimeFilter] = useState("24h");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? allAlerts : allAlerts.filter(a => a.severity === filter);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar search={search} onSearchChange={setSearch} timeFilter={timeFilter} onTimeFilterChange={setTimeFilter} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Alerts", value: "7", icon: Bell, color: "text-destructive" },
              { label: "Critical", value: "4", icon: AlertTriangle, color: "text-destructive" },
              { label: "Investigating", value: "2", icon: ShieldAlert, color: "text-warning" },
              { label: "Resolved Today", value: "12", icon: CheckCircle, color: "text-success" },
            ].map((s) => (
              <div key={s.label} className="metric-card group">
                <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <span className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Alert history chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 glow-border">
              <h3 className="text-sm font-semibold text-foreground mb-1">📊 Alert History</h3>
              <p className="text-xs text-muted-foreground mb-5">Alerts by severity over the past week</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={alertHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 16%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="critical" name="Critical" fill="hsl(0, 72%, 51%)" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="warning" name="Warning" fill="hsl(38, 92%, 50%)" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="info" name="Info" fill="hsl(217, 91%, 60%)" radius={[2, 2, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Risk trend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 glow-border-secondary">
              <h3 className="text-sm font-semibold text-foreground mb-1">⚠️ Risk Score Trend</h3>
              <p className="text-xs text-muted-foreground mb-5">Overall market risk level today</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={riskTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 16%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="risk" name="Risk" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ fill: "hsl(0, 72%, 51%)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Alert feed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 glow-border">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground">🚨 Live Alert Feed</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time risk monitoring</p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                {["all", "critical", "high", "medium", "low"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                      filter === f ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filtered.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${colorMap[a.type]}`}
                >
                  <a.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColorMap[a.type]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground">{a.title}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{a.coin}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${statusColors[a.status]}`}>{a.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Alerts;
