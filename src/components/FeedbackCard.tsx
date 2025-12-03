import { FeedbackItem } from '@/types/feedback';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Calendar, Tag, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackCardProps {
  item: FeedbackItem;
  onDelete: (id: string) => void;
}

const importanceStyles = {
  critical: 'importance-critical',
  high: 'importance-high',
  medium: 'importance-medium',
  low: 'importance-low'
};

const costLabels = {
  'low': '< 1 week',
  'medium': '1-4 weeks',
  'high': '1-3 months',
  'very-high': '3+ months'
};

export function FeedbackCard({ item, onDelete }: FeedbackCardProps) {
  return (
    <Card className="group border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className="font-medium">
                <Tag className="w-3 h-3 mr-1" />
                {item.theme}
              </Badge>
              <Badge className={cn('border', importanceStyles[item.importance])}>
                {item.importance.charAt(0).toUpperCase() + item.importance.slice(1)}
              </Badge>
            </div>
            
            <p className="text-foreground leading-relaxed mb-3">
              {item.content}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs">Alignment:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      className={cn(
                        'w-3.5 h-3.5',
                        n <= item.businessAlignment
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground/20'
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{costLabels[item.costEstimate]}</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.createdAt.toLocaleDateString()}</span>
              </div>

              {item.source && (
                <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                  {item.source}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
