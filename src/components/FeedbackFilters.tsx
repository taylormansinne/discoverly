import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { THEMES, IMPORTANCE_OPTIONS, COST_OPTIONS } from '@/types/feedback';
import { Filter, X, Zap } from 'lucide-react';

interface FeedbackFiltersProps {
  themeFilter: string;
  importanceFilter: string;
  costFilter: string;
  sortBy: string;
  quickWinsOnly: boolean;
  onThemeChange: (value: string) => void;
  onImportanceChange: (value: string) => void;
  onCostChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onQuickWinsChange: (value: boolean) => void;
  onClear: () => void;
}

export function FeedbackFilters({
  themeFilter,
  importanceFilter,
  costFilter,
  sortBy,
  quickWinsOnly,
  onThemeChange,
  onImportanceChange,
  onCostChange,
  onSortChange,
  onQuickWinsChange,
  onClear
}: FeedbackFiltersProps) {
  const hasFilters = themeFilter !== 'all' || importanceFilter !== 'all' || costFilter !== 'all' || quickWinsOnly;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border border-border/50">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="w-4 h-4" />
        Filters:
      </div>

      <Button
        variant={quickWinsOnly ? "default" : "outline"}
        size="sm"
        onClick={() => onQuickWinsChange(!quickWinsOnly)}
        className="gap-1.5"
      >
        <Zap className="w-4 h-4" />
        Quick Wins
      </Button>

      <Select value={themeFilter} onValueChange={onThemeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Themes</SelectItem>
          {THEMES.map(t => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={importanceFilter} onValueChange={onImportanceChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Importance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Importance</SelectItem>
          {IMPORTANCE_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={costFilter} onValueChange={onCostChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Cost" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Costs</SelectItem>
          {COST_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="importance">By Importance</SelectItem>
            <SelectItem value="alignment">By Alignment</SelectItem>
            <SelectItem value="cost">By Cost</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
