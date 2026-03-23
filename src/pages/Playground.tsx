import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles, Rocket, MessagesSquare, Coins } from "lucide-react";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import TopBar from "@/components/dashboard/TopBar";
import { formatCompactNumber, formatPercent, formatPrice } from "@/lib/api";

type SimPoint = {
  day: number;
  price: number;
  hype: number;
  mentions: number;
  marketCap: number;
};

type SourceShare = {
  source: string;
  mentions: number;
};

type CoinDraft = {
  name: string;
  symbol: string;
  supply: number;
  launchPrice: number;
};

type Scenario = {
  mentionsBase: number;
  sentiment: number;
  influencerPower: number;
  memeVirality: number;
  communityConsistency: number;
};

const sourceColors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--success))", "hsl(var(--warning))"];

function seededNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function runSimulation(coin: CoinDraft, scenario: Scenario, days = 30): SimPoint[] {
  const points: SimPoint[] = [];
  let price = coin.launchPrice;

  for (let day = 0; day <= days; day += 1) {
    const wave = Math.sin((day / days) * Math.PI * 2) * (scenario.memeVirality / 10);
    const burst = seededNoise(day + scenario.influencerPower) * (scenario.influencerPower / 4);
    const sentimentFactor = (scenario.sentiment - 50) / 50;
    const consistencyFactor = (scenario.communityConsistency - 50) / 50;

    const mentions = Math.max(
      100,
      Math.round(
        scenario.mentionsBase *
          (1 + day * 0.03 + wave * 0.02 + burst * 0.04 + consistencyFactor * 0.2)
      )
    );

    const hype = clamp(
      50 +
        (mentions / scenario.mentionsBase - 1) * 30 +
        sentimentFactor * 22 +
        (scenario.influencerPower - 50) * 0.35 +
        burst * 0.9,
      0,
      100
    );

    const dailyDrift = (hype - 50) / 320 + sentimentFactor / 100 + consistencyFactor / 180;
    const volatility = (seededNoise(day * 17 + scenario.memeVirality) - 0.5) * 0.09;
    price = Math.max(0.0000001, price * (1 + dailyDrift + volatility));

    points.push({
      day,
      price: Number(price.toFixed(6)),
      hype: Number(hype.toFixed(2)),
      mentions,
      marketCap: Number((price * coin.supply).toFixed(0)),
    });
  }

  return points;
}

const Playground = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeFilter, setTimeFilter] = useState("30d");
  const [search, setSearch] = useState("");

  const [coin, setCoin] = useState<CoinDraft>({
    name: "HypeFrog",
    symbol: "HFRG",
    supply: 1_000_000_000,
    launchPrice: 0.000012,
  });

  const [scenario, setScenario] = useState<Scenario>({
    mentionsBase: 4200,
    sentiment: 68,
    influencerPower: 72,
    memeVirality: 84,
    communityConsistency: 62,
  });

  const [runId, setRunId] = useState(1);

  const simulation = useMemo(() => runSimulation(coin, scenario, 30), [coin, scenario, runId]);

  const latest = simulation[simulation.length - 1];
  const first = simulation[0];
  const growthPct = ((latest.price - first.price) / first.price) * 100;

  const sourceShare: SourceShare[] = useMemo(() => {
    const totalMentions = simulation.reduce((sum, p) => sum + p.mentions, 0);
    const twitterShare = clamp(0.48 + (scenario.memeVirality - 50) / 250, 0.3, 0.7);
    const redditShare = clamp(0.32 + (scenario.communityConsistency - 50) / 280, 0.15, 0.5);
    const telegramShare = clamp(1 - twitterShare - redditShare, 0.1, 0.4);

    const twitter = Math.round(totalMentions * twitterShare);
    const reddit = Math.round(totalMentions * redditShare);
    const telegram = Math.round(totalMentions * telegramShare);
    const other = Math.max(0, totalMentions - twitter - reddit - telegram);

    return [
      { source: "Twitter/X", mentions: twitter },
      { source: "Reddit", mentions: reddit },
      { source: "Telegram", mentions: telegram },
      { source: "Other", mentions: other },
    ];
  }, [simulation, scenario.communityConsistency, scenario.memeVirality]);

  const launchSimulation = () => {
    setRunId((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background flex gradient-bg-subtle">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar
          search={search}
          onSearchChange={setSearch}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-secondary/30 bg-gradient-to-r from-secondary/10 via-card/80 to-primary/10 p-6"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-lg font-bold text-foreground">Meme Coin Playground</h1>
                <p className="text-sm text-muted-foreground">
                  Create your own meme coin and visualize how social hype can move its value.
                </p>
              </div>
              <button
                onClick={launchSimulation}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Rocket className="h-4 w-4" />
                Run New Simulation
              </button>
            </div>
          </motion.section>

          <div className="grid xl:grid-cols-3 gap-6">
            <motion.section
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="xl:col-span-1 glass rounded-2xl p-5 space-y-5"
            >
              <div>
                <h2 className="text-sm font-semibold text-foreground">Coin Builder</h2>
                <p className="text-xs text-muted-foreground">Define your meme coin profile and social conditions.</p>
              </div>

              <div className="space-y-3">
                <label className="text-xs text-muted-foreground">Coin Name</label>
                <input
                  value={coin.name}
                  onChange={(e) => setCoin((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                />

                <label className="text-xs text-muted-foreground">Ticker Symbol</label>
                <input
                  value={coin.symbol}
                  onChange={(e) => setCoin((prev) => ({ ...prev, symbol: e.target.value.toUpperCase().slice(0, 8) }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                />

                <label className="text-xs text-muted-foreground">Total Supply</label>
                <input
                  type="number"
                  value={coin.supply}
                  onChange={(e) => setCoin((prev) => ({ ...prev, supply: Math.max(1, Number(e.target.value) || 1) }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                />

                <label className="text-xs text-muted-foreground">Launch Price (USD)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={coin.launchPrice}
                  onChange={(e) => setCoin((prev) => ({ ...prev, launchPrice: Math.max(0.0000001, Number(e.target.value) || 0.0000001) }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-4">
                {[
                  { key: "mentionsBase", label: "Daily Mentions Base", min: 500, max: 30000 },
                  { key: "sentiment", label: "Social Sentiment", min: 0, max: 100 },
                  { key: "influencerPower", label: "Influencer Power", min: 0, max: 100 },
                  { key: "memeVirality", label: "Meme Virality", min: 0, max: 100 },
                  { key: "communityConsistency", label: "Community Consistency", min: 0, max: 100 },
                ].map((control) => (
                  <div key={control.key}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{control.label}</span>
                      <span className="font-mono text-foreground">{scenario[control.key as keyof Scenario]}</span>
                    </div>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      value={scenario[control.key as keyof Scenario]}
                      onChange={(e) =>
                        setScenario((prev) => ({
                          ...prev,
                          [control.key]: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                ))}
              </div>
            </motion.section>

            <div className="xl:col-span-2 space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div className="metric-card">
                  <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                  <div className="text-xl font-semibold text-primary font-mono">{formatPrice(latest.price)}</div>
                </div>
                <div className="metric-card">
                  <div className="text-xs text-muted-foreground mb-1">Value Growth</div>
                  <div className={`text-xl font-semibold font-mono ${growthPct >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatPercent(growthPct)}
                  </div>
                </div>
                <div className="metric-card">
                  <div className="text-xs text-muted-foreground mb-1">Hype Index</div>
                  <div className="text-xl font-semibold text-secondary font-mono">{latest.hype.toFixed(1)}</div>
                </div>
                <div className="metric-card">
                  <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                  <div className="text-xl font-semibold text-foreground font-mono">{formatCompactNumber(latest.marketCap)}</div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="glass rounded-2xl p-5"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  Hype vs Coin Value Projection ({coin.symbol})
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={simulation}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="hypeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area yAxisId="left" type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="url(#priceGradient)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="hype" stroke="hsl(var(--secondary))" fill="url(#hypeGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.section>

              <div className="grid lg:grid-cols-2 gap-6">
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MessagesSquare className="h-4 w-4 text-warning" />
                    Daily Mentions Momentum
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={simulation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="mentions" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.22 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Coins className="h-4 w-4 text-success" />
                    Mention Source Distribution
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={sourceShare} dataKey="mentions" nameKey="source" outerRadius={84} label>
                        {sourceShare.map((entry, index) => (
                          <Cell key={`source-${entry.source}`} fill={sourceColors[index % sourceColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Playground;
