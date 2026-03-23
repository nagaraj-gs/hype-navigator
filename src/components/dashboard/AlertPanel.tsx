import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { fetchJson, timeAgo } from "@/lib/api";

type AlertItem = {
  id: number;
  severity: string;
  title: string;
  coin_symbol: string;
  message: string;
  created_at: string;
};

type UIAlert = {
  type: string;
  icon: typeof AlertTriangle;
  title: string;
  coin: string;
  message: string;
  time: string;
};

const fallbackAlerts: UIAlert[] = [
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

const getType = (severity: string): "danger" | "warning" | "info" => {
  if (severity === "critical") return "danger";
  if (severity === "high" || severity === "medium") return "warning";
  return "info";
};

const getIcon = (type: string) => {
  if (type === "danger") return AlertTriangle;
  if (type === "warning") return TrendingUp;
  return Zap;
};

const AlertPanel = () => {
  const [alerts, setAlerts] = useState<UIAlert[]>(fallbackAlerts);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const payload = await fetchJson<AlertItem[]>("/alerts?status=active&limit=8");
        if (!mounted || payload.length === 0) return;

        setAlerts(
          payload.map((item) => {
            const type = getType(item.severity);
            return {
              type,
              icon: getIcon(type),
              title: item.title,
              coin: `$${item.coin_symbol}`,
              message: item.message,
              time: timeAgo(item.created_at),
            };
          })
        );
      } catch {
        // Keep fallback alerts when backend is unavailable.
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
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
};

export default AlertPanel;
