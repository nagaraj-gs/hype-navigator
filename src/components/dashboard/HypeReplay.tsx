import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/api";

const fallbackData = [20, 28, 25, 35, 50, 85, 95, 80, 60, 45, 38, 55, 72, 90, 65, 48, 52, 70, 62, 40];

type TrendPoint = {
  ts: string;
  mentions: number;
};

const normalizeMentionsToPercent = (values: number[]) => {
  if (values.length === 0) return fallbackData;
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max === min) return values.map(() => 60);
  return values.map((v) => Math.max(15, Math.round(((v - min) / (max - min)) * 100)));
};

const fallbackLabels = ["Day 1", "", "", "", "Day 5", "", "", "", "", "Day 10", "", "", "", "", "Day 15", "", "", "", "", "Day 20"];

const HypeReplay = () => {
  const [data, setData] = useState(fallbackData);
  const [labels, setLabels] = useState(fallbackLabels);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const payload = await fetchJson<TrendPoint[]>("/dashboard/trend-chart?symbol=DOGE&limit=20");
        if (!mounted || payload.length === 0) return;

        const ordered = payload.slice().reverse();
        const mentionValues = ordered.map((point) => point.mentions);
        const normalized = normalizeMentionsToPercent(mentionValues);
        const dynamicLabels = ordered.map((point, index) => {
          if (index % 4 !== 0 && index !== ordered.length - 1) return "";
          return new Date(point.ts).toLocaleDateString([], { month: "short", day: "numeric" });
        });

        setData(normalized);
        setLabels(dynamicLabels);
      } catch {
        // Keep fallback replay values when backend is unavailable.
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setPosition((prev) => {
          if (prev >= data.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const currentValue = data[position];
  const peak = Math.max(...data);
  const isPeak = currentValue === peak;

  return (
    <div className="glass rounded-2xl p-6 glow-border h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">⏳ Hype Replay</h3>
          <p className="text-xs text-muted-foreground mt-0.5">$DOGE • Mentions replay</p>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold font-mono ${isPeak ? "text-warning" : "text-primary"}`}>
            {currentValue}%
          </div>
          <span className="text-[10px] text-muted-foreground">Frame {position + 1}/{data.length}</span>
        </div>
      </div>

      {/* Timeline bars */}
      <div className="h-36 flex items-end gap-[3px] mb-2 flex-1">
        {data.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-300 relative group cursor-pointer"
            onClick={() => { setPosition(i); setPlaying(false); }}
            style={{
              height: `${h}%`,
              background: i <= position
                ? i === position
                  ? `linear-gradient(to top, hsl(270, 70%, 60%), hsl(217, 91%, 60%))`
                  : `linear-gradient(to top, hsl(217, 91%, 60%), hsl(270, 70%, 60%))`
                : "hsl(228, 12%, 14%)",
              opacity: i <= position ? 1 : 0.3,
              boxShadow: i === position ? "0 0 12px hsla(217, 91%, 60%, 0.5)" : "none",
            }}
          >
            {/* Tooltip on hover */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 glass-strong rounded px-2 py-1 text-[10px] text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {h}%
            </div>
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between mb-3">
        {labels.map((l, i) => (
          <span key={i} className="text-[9px] text-muted-foreground flex-1 text-center">{l}</span>
        ))}
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={data.length - 1}
        value={position}
        onChange={(e) => { setPosition(Number(e.target.value)); setPlaying(false); }}
        className="w-full h-1 appearance-none bg-muted rounded-full mb-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setPosition(0); setPlaying(false); }}>
          <SkipBack className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 glow-border rounded-full"
          onClick={() => {
            if (position >= data.length - 1) setPosition(0);
            setPlaying(!playing);
          }}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setPosition(data.length - 1); setPlaying(false); }}>
          <SkipForward className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default HypeReplay;
