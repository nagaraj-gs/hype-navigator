import { Activity, ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";

const metrics = [
  {
    label: "Hype Score",
    value: "78",
    suffix: "/100",
    icon: Activity,
    color: "text-primary",
    ring: 78,
  },
  {
    label: "Trust Score",
    value: "87",
    suffix: "%",
    icon: ShieldCheck,
    color: "text-success",
    ring: 87,
  },
  {
    label: "Risk Level",
    value: "Medium",
    suffix: "",
    icon: AlertTriangle,
    color: "text-warning",
    ring: 55,
  },
  {
    label: "Prediction",
    value: "↑ Up",
    suffix: "73% conf.",
    icon: TrendingUp,
    color: "text-success",
    ring: 73,
  },
];

const MetricCards = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {metrics.map((m) => (
      <div key={m.label} className="metric-card relative overflow-hidden group">
        {/* Subtle background ring */}
        <svg className="absolute top-3 right-3 w-12 h-12 -rotate-90 opacity-30 group-hover:opacity-60 transition-opacity" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
          <circle
            cx="18" cy="18" r="15.5" fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${m.ring} ${100 - m.ring}`}
            className={m.color}
          />
        </svg>

        <m.icon className={`w-5 h-5 ${m.color} mb-3`} />
        <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono ${m.color}`}>{m.value}</span>
          {m.suffix && <span className="text-xs text-muted-foreground">{m.suffix}</span>}
        </div>
      </div>
    ))}
  </div>
);

export default MetricCards;
