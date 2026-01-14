import { useMemo } from 'react';
import { FeedbackItem, CostEstimate, Importance } from '@/types/feedback';
import { ScoringWeights } from '@/hooks/useScoringPreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Trophy, Zap, Target, Clock, Scale, Info } from 'lucide-react';

interface VoteCounts {
  [feedbackId: string]: {
    upvotes: number;
    downvotes: number;
    userVote: number | null;
  };
}

interface PrioritizationDashboardProps {
  items: FeedbackItem[];
  voteCounts: VoteCounts;
  weights: ScoringWeights;
}

// Normalize importance to 0-100
const importanceScore: Record<Importance, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

// Normalize cost (inverse - lower cost = higher score)
const costScore: Record<CostEstimate, number> = {
  low: 100,
  medium: 66,
  high: 33,
  'very-high': 0,
};

interface ScoredItem extends FeedbackItem {
  compositeScore: number;
  voteScore: number;
  normalizedVoteScore: number;
  importanceValue: number;
  alignmentValue: number;
  costValue: number;
  netVotes: number;
}

export function PrioritizationDashboard({ items, voteCounts, weights }: PrioritizationDashboardProps) {
  const scoredItems = useMemo(() => {
    if (items.length === 0) return [];

    // Calculate net votes for all items
    const itemsWithVotes = items.map(item => {
      const votes = voteCounts[item.id] || { upvotes: 0, downvotes: 0 };
      const netVotes = votes.upvotes - votes.downvotes;
      return { ...item, netVotes };
    });

    // Find max votes for normalization
    const maxVotes = Math.max(...itemsWithVotes.map(i => Math.abs(i.netVotes)), 1);

    // Calculate composite scores
    const scored: ScoredItem[] = itemsWithVotes.map(item => {
      // Normalize vote score to 0-100
      const normalizedVoteScore = ((item.netVotes + maxVotes) / (2 * maxVotes)) * 100;
      
      const importanceValue = importanceScore[item.importance];
      const alignmentValue = (item.businessAlignment / 5) * 100;
      const costValue = costScore[item.costEstimate];

      const compositeScore = 
        weights.votes * normalizedVoteScore +
        weights.importance * importanceValue +
        weights.alignment * alignmentValue +
        weights.cost * costValue;

      return {
        ...item,
        compositeScore: Math.round(compositeScore),
        voteScore: item.netVotes,
        normalizedVoteScore: Math.round(normalizedVoteScore),
        importanceValue,
        alignmentValue: Math.round(alignmentValue),
        costValue,
        netVotes: item.netVotes,
      };
    });

    // Sort by composite score
    return scored.sort((a, b) => b.compositeScore - a.compositeScore);
  }, [items, voteCounts]);

  const topItems = scoredItems.slice(0, 10);
  const quickWins = scoredItems.filter(
    item => item.costValue >= 66 && (item.importanceValue >= 75 || item.alignmentValue >= 80)
  ).slice(0, 5);

  // Chart data
  const chartData = topItems.map(item => ({
    name: item.content.length > 25 ? item.content.substring(0, 25) + '...' : item.content,
    score: item.compositeScore,
    votes: item.normalizedVoteScore * weights.votes,
    importance: item.importanceValue * weights.importance,
    alignment: item.alignmentValue * weights.alignment,
    cost: item.costValue * weights.cost,
  }));

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Prioritization Scoring
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Composite score = Votes ({Math.round(weights.votes * 100)}%) + Importance ({Math.round(weights.importance * 100)}%) + 
                Business Alignment ({Math.round(weights.alignment * 100)}%) + Low Cost Bonus ({Math.round(weights.cost * 100)}%)
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Wins Section */}
        {quickWins.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Wins
              <Badge variant="secondary" className="ml-2 text-xs">{quickWins.length}</Badge>
            </h4>
            <div className="space-y-2">
              {quickWins.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.content}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">{item.theme}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.costEstimate}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-600">{item.compositeScore}</div>
                    <div className="text-xs text-muted-foreground">score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Scored Items */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-primary" />
            Top Priorities
          </h4>
          <div className="space-y-3">
            {topItems.slice(0, 5).map((item, index) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-medium text-muted-foreground w-5">#{index + 1}</span>
                    <span className="text-sm font-medium truncate">{item.content}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge 
                      variant={item.status === 'released' ? 'default' : item.status === 'planned' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                    <span className="text-lg font-bold text-primary">{item.compositeScore}</span>
                  </div>
                </div>
                
                {/* Score Breakdown Bar */}
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-muted/50">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="bg-chart-1 transition-all" 
                        style={{ width: `${item.normalizedVoteScore * weights.votes}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Votes: {item.netVotes} ({Math.round(item.normalizedVoteScore * weights.votes)} pts)</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="bg-chart-2 transition-all" 
                        style={{ width: `${item.importanceValue * weights.importance}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Importance: {item.importance} ({Math.round(item.importanceValue * weights.importance)} pts)</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="bg-chart-3 transition-all" 
                        style={{ width: `${item.alignmentValue * weights.alignment}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Alignment: {item.businessAlignment}/5 ({Math.round(item.alignmentValue * weights.alignment)} pts)</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="bg-chart-4 transition-all" 
                        style={{ width: `${item.costValue * weights.cost}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cost Efficiency: {item.costEstimate} ({Math.round(item.costValue * weights.cost)} pts)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Legend */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-chart-1" />
            <span>Votes ({Math.round(weights.votes * 100)}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-chart-2" />
            <span>Importance ({Math.round(weights.importance * 100)}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-chart-3" />
            <span>Alignment ({Math.round(weights.alignment * 100)}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-chart-4" />
            <span>Cost Efficiency ({Math.round(weights.cost * 100)}%)</span>
          </div>
        </div>

        {/* Stacked Bar Chart */}
        {topItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              Score Comparison
            </h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100} 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name: string) => [Math.round(value), name]}
                  />
                  <Bar dataKey="votes" stackId="score" fill="hsl(var(--chart-1))" name="Votes" />
                  <Bar dataKey="importance" stackId="score" fill="hsl(var(--chart-2))" name="Importance" />
                  <Bar dataKey="alignment" stackId="score" fill="hsl(var(--chart-3))" name="Alignment" />
                  <Bar dataKey="cost" stackId="score" fill="hsl(var(--chart-4))" name="Cost Efficiency" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
