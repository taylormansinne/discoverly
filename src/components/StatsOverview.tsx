import { FeedbackItem } from '@/types/feedback';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface StatsOverviewProps {
  items: FeedbackItem[];
}

export function StatsOverview({ items }: StatsOverviewProps) {
  const totalFeedback = items.length;
  const criticalCount = items.filter(i => i.importance === 'critical').length;
  const highAlignmentCount = items.filter(i => i.businessAlignment >= 4).length;
  const quickWins = items.filter(i => 
    i.businessAlignment >= 4 && (i.costEstimate === 'low' || i.costEstimate === 'medium')
  ).length;

  const stats = [
    {
      label: 'Total Feedback',
      value: totalFeedback,
      icon: MessageSquare,
      color: 'text-primary'
    },
    {
      label: 'Critical Items',
      value: criticalCount,
      icon: AlertTriangle,
      color: 'text-destructive'
    },
    {
      label: 'High Alignment',
      value: highAlignmentCount,
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      label: 'Quick Wins',
      value: quickWins,
      icon: Clock,
      color: 'text-primary'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(stat => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
