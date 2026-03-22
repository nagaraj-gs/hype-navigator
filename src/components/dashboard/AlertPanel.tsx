import { AlertTriangle, TrendingUp, Zap } from "lucide-react";

const alerts = [
  {
    type: "danger",
    icon: AlertTriangle,
    title: "Pump Detected",
    coin: "$SHIB",
    message: "Volume spike of 340% in 2h with coordinated social activity",
    time: "2 min ago",
  },
  {
    type: "warning",
    icon: TrendingUp,
    title: "Unusual Spike",
    coin: "$PEPE",
    message: "Mentions increased 180% — 67% from new accounts",
    time: "14 min ago",
  },
  {
    type: "danger",
    icon: AlertTriangle,
    title: "High Risk Coin",
    coin: "$BONK",
    message: "Trust score dropped to 23. Multiple red flags detected.",
    time: "28 min ago",
  },
  {
    type: "info",
    icon: Zap,
    title: "New Trend",
    coin: "$WIF",
    message: "Emerging trend detected — organic growth pattern confirmed",
    time: "45 min ago",
  },
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

const AlertPanel = () => (
  <div className="glass rounded-2xl p-6 glow-border">
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">🚨 Alert System</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time risk monitoring</p>
      </div>
      <span className="text-xs font-mono text-primary">{alerts.length} active</span>
    </div>

    <div className="space-y-3">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${colorMap[a.type]}`}
        >
          <a.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColorMap[a.type]}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-foreground">{a.title}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{a.coin}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{a.message}</p>
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
        </div>
      ))}
    </div>
  </div>
);

export default AlertPanel;
