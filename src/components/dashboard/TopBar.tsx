import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  timeFilter: string;
  onTimeFilterChange: (val: string) => void;
  onToggleSidebar: () => void;
}

const timeOptions = ["1h", "6h", "24h", "7d"];

const TopBar = ({ search, onSearchChange, timeFilter, onTimeFilterChange, onToggleSidebar }: Props) => (
  <header className="h-14 border-b border-border glass-strong flex items-center px-4 gap-4 sticky top-0 z-30">
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
      <Menu className="w-4 h-4" />
    </Button>

    <div className="flex-1 flex items-center gap-2 max-w-sm">
      <Search className="w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search coin..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
      />
    </div>

    <div className="flex items-center gap-1 glass rounded-lg p-1">
      {timeOptions.map((t) => (
        <button
          key={t}
          onClick={() => onTimeFilterChange(t)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            timeFilter === t
              ? "gradient-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  </header>
);

export default TopBar;
