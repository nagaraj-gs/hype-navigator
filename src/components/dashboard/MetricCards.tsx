import { useEffect, useMemo, useState } from "react";
import { Activity, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { fetchJson } from "@/lib/api";

type TrendingCoin = {
  symbol: string;
  hype_score: number;
  trust_score: number;
  risk_level: string;
  prediction: string;
  prediction_confidence: number;
};

const fallbackCoin: TrendingCoin = {
  symbol: "DOGE",
  hype_score: 78,
  trust_score: 87,
  risk_level: "Medium",
  prediction: "Up",
  prediction_confidence: 73,
};

const MetricCards = () => {
  const [coin, setCoin] = useState<TrendingCoin>(fallbackCoin);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const trending = await fetchJson<TrendingCoin[]>("/dashboard/trending?limit=1");
        if (mounted && trending.length > 0) {
          setCoin(trending[0]);
        }
      } catch {
        // Keep fallback values when the backend cannot be reached.
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const predictionUp = coin.prediction.toLowerCase() === "up";
  const riskRing = coin.risk_level === "Low" ? 25 : coin.risk_level === "Medium" ? 55 : coin.risk_level === "High" ? 75 : 90;
  const riskColor = coin.risk_level === "Low" ? "text-success" : coin.risk_level === "Medium" ? "text-warning" : "text-destructive";

  const metrics = useMemo(
    () => [
      {
        label: "Hype Score",
        value: `${coin.hype_score}`,
        suffix: "/100",
        icon: Activity,
        color: "text-primary",
        ring: coin.hype_score,
      },
      {
        label: "Trust Score",
        value: `${coin.trust_score}`,
        suffix: "%",
        icon: ShieldCheck,
        color: coin.trust_score >= 60 ? "text-success" : "text-warning",
        ring: coin.trust_score,
      },
      {
        label: "Risk Level",
        value: coin.risk_level,
        suffix: "",
        icon: AlertTriangle,
        color: riskColor,
        ring: riskRing,
      },
      {
        label: "Prediction",
        value: `${predictionUp ? "↑" : "↓"} ${coin.prediction}`,
        suffix: `${coin.prediction_confidence}% conf.`,
        icon: predictionUp ? TrendingUp : TrendingDown,
        color: predictionUp ? "text-success" : "text-destructive",
        ring: coin.prediction_confidence,
      },
    ],
    [coin, predictionUp, riskColor, riskRing]
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="metric-card relative overflow-hidden group">
          {/* Subtle background ring */}
          <svg className="absolute top-3 right-3 w-12 h-12 -rotate-90 opacity-30 group-hover:opacity-60 transition-opacity" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
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
};

export default MetricCards;
