import { useMemo } from 'react';
import { FeedbackItem } from '@/types/feedback';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Lightbulb, Clock, CheckCircle2, Zap } from 'lucide-react';

interface GanttTimelineProps {
  items: FeedbackItem[];
  voteCounts: Record<string, { upvotes: number; downvotes: number; userVote: number | null }>;
}

// Map cost estimate to duration (weeks)
const costToDuration: Record<string, number> = {
  low: 1,
  medium: 3,
  high: 6,
  'very-high': 10,
};

// Map status to timeline position
const statusToPosition: Record<string, number> = {
  released: 0,   // Past - completed
  planned: 1,    // Current - in progress
  idea: 2,       // Future - backlog
};

const statusConfig = {
  idea: { label: 'Backlog', icon: Lightbulb, color: 'bg-primary/80', borderColor: 'border-primary' },
  planned: { label: 'In Progress', icon: Clock, color: 'bg-warning/80', borderColor: 'border-warning' },
  released: { label: 'Completed', icon: CheckCircle2, color: 'bg-success/80', borderColor: 'border-success' },
};

export function GanttTimeline({ items, voteCounts }: GanttTimelineProps) {
  // Group and sort items by status, then by vote score
  const timelineData = useMemo(() => {
    const phases = ['released', 'planned', 'idea'] as const;
    
    return phases.map(status => {
      const phaseItems = items
        .filter(item => (item.status || 'idea') === status)
        .map(item => {
          const votes = voteCounts[item.id] || { upvotes: 0, downvotes: 0 };
          const score = votes.upvotes - votes.downvotes;
          const duration = costToDuration[item.costEstimate] || 3;
          const isQuickWin = item.importance === 'critical' || item.importance === 'high' || item.businessAlignment >= 4;
          return { ...item, score, duration, isQuickWin };
        })
        .sort((a, b) => b.score - a.score);
      
      return { status, items: phaseItems, config: statusConfig[status] };
    });
  }, [items, voteCounts]);

  // Calculate max duration for scaling
  const maxDuration = Math.max(...items.map(i => costToDuration[i.costEstimate] || 3), 10);

  return (
    <div className="space-y-6">
      {/* Timeline header */}
      <div className="flex items-center gap-4 px-4">
        <div className="w-48 text-sm font-medium text-muted-foreground">Phase</div>
        <div className="flex-1 relative">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Week 1</span>
            <span>Week {Math.ceil(maxDuration / 2)}</span>
            <span>Week {maxDuration}+</span>
          </div>
          <div className="absolute inset-x-0 top-6 h-px bg-border" />
        </div>
      </div>

      {/* Timeline phases */}
      <TooltipProvider>
        {timelineData.map(({ status, items: phaseItems, config }) => {
          const Icon = config.icon;
          
          return (
            <div key={status} className="space-y-2">
              {/* Phase header */}
              <div className="flex items-center gap-4 px-4">
                <div className="w-48">
                  <Badge 
                    variant="outline" 
                    className={cn('gap-1.5', config.borderColor)}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {config.label}
                    <span className="ml-1 text-muted-foreground">({phaseItems.length})</span>
                  </Badge>
                </div>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Items */}
              {phaseItems.length === 0 ? (
                <div className="flex items-center gap-4 px-4">
                  <div className="w-48" />
                  <p className="text-sm text-muted-foreground italic">No items</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {phaseItems.map((item, index) => {
                    const widthPercent = (item.duration / maxDuration) * 100;
                    // Stagger start positions slightly for visual interest
                    const offsetPercent = status === 'released' ? 0 : (index * 2) % 15;
                    
                    return (
                      <div key={item.id} className="flex items-center gap-4 px-4 group">
                        {/* Item label */}
                        <div className="w-48 truncate text-sm text-foreground">
                          {item.content.slice(0, 40)}{item.content.length > 40 ? '...' : ''}
                        </div>
                        
                        {/* Gantt bar */}
                        <div className="flex-1 relative h-8">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  'absolute top-1 h-6 rounded-md transition-all cursor-pointer',
                                  'hover:ring-2 hover:ring-offset-2 hover:ring-offset-background',
                                  config.color,
                                  item.isQuickWin && 'ring-1 ring-amber-500/50'
                                )}
                                style={{
                                  left: `${offsetPercent}%`,
                                  width: `${Math.max(widthPercent, 8)}%`,
                                }}
                              >
                                <div className="flex items-center h-full px-2 gap-1.5 overflow-hidden">
                                  {item.isQuickWin && (
                                    <Zap className="w-3 h-3 text-amber-300 fill-amber-300 flex-shrink-0" />
                                  )}
                                  <span className="text-xs text-white font-medium truncate">
                                    {item.theme}
                                  </span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1.5">
                                <p className="font-medium">{item.content}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Theme: {item.theme}</span>
                                  <span>•</span>
                                  <span>Est. {item.duration} week{item.duration > 1 ? 's' : ''}</span>
                                  <span>•</span>
                                  <span>Votes: {item.score > 0 ? '+' : ''}{item.score}</span>
                                </div>
                                {item.isQuickWin && (
                                  <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs">
                                    <Zap className="w-3 h-3 mr-1 fill-current" />
                                    Quick Win
                                  </Badge>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </TooltipProvider>

      {/* Legend */}
      <Card className="p-4 mt-6">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium">Duration based on cost:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <span>Low = ~1 week</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-3 rounded bg-muted" />
            <span>Medium = ~3 weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-10 h-3 rounded bg-muted" />
            <span>High = ~6 weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-14 h-3 rounded bg-muted" />
            <span>Very High = ~10 weeks</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Quick Win</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
