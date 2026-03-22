import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

const data = [20, 28, 25, 35, 50, 85, 95, 80, 60, 45, 38, 55, 72, 90, 65, 48, 52, 70, 62, 40];

const HypeReplay = () => {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(12);

  return (
    <div className="glass rounded-2xl p-6 glow-border h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">⏳ Hype Replay</h3>
          <p className="text-xs text-muted-foreground mt-0.5">$DOGE • Last 7 days</p>
        </div>
        <span className="text-xs font-mono text-muted-foreground">Frame {position}/{data.length}</span>
      </div>

      {/* Timeline bars */}
      <div className="h-36 flex items-end gap-[3px] mb-5">
        {data.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-300"
            style={{
              height: `${h}%`,
              background: i <= position
                ? `linear-gradient(to top, hsl(217, 91%, 60%), hsl(270, 70%, 60%))`
                : "hsl(228, 12%, 14%)",
              opacity: i <= position ? 1 : 0.3,
              boxShadow: i === position ? "0 0 10px hsla(217, 91%, 60%, 0.4)" : "none",
            }}
          />
        ))}
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={data.length - 1}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="w-full h-1 appearance-none bg-muted rounded-full mb-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setPosition(0)}>
          <SkipBack className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 glow-border rounded-full"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setPosition(data.length - 1)}>
          <SkipForward className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default HypeReplay;
