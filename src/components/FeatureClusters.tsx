import { useState, useMemo } from 'react';
import { FeedbackItem, CostEstimate, Importance } from '@/types/feedback';
import { Feature, FEATURE_STATUS_OPTIONS } from '@/types/feature';
import { ScoringWeights } from '@/hooks/useScoringPreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Plus, Link2, Unlink, Trash2, ChevronDown, ChevronUp, Target, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteCounts {
  [feedbackId: string]: {
    upvotes: number;
    downvotes: number;
    userVote: number | null;
  };
}

interface FeatureClustersProps {
  features: Feature[];
  feedbackItems: FeedbackItem[];
  voteCounts: VoteCounts;
  weights: ScoringWeights;
  onAddFeature: (feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Feature | null>;
  onUpdateFeature: (id: string, updates: Partial<Feature>) => Promise<void>;
  onDeleteFeature: (id: string) => Promise<void>;
  onLinkFeedback: (feedbackId: string, featureId: string | undefined) => Promise<void>;
}

const importanceScore: Record<Importance, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

const costScore: Record<CostEstimate, number> = {
  low: 100,
  medium: 66,
  high: 33,
  'very-high': 0,
};

interface AggregatedScore {
  composite: number;
  votes: number;
  importance: number;
  alignment: number;
  cost: number;
  feedbackCount: number;
}

function calculateAggregatedScore(
  feedbackItems: FeedbackItem[],
  voteCounts: VoteCounts,
  weights: ScoringWeights
): AggregatedScore {
  if (feedbackItems.length === 0) {
    return { composite: 0, votes: 0, importance: 0, alignment: 0, cost: 0, feedbackCount: 0 };
  }

  // Calculate totals
  let totalVotes = 0;
  let totalImportance = 0;
  let totalAlignment = 0;
  let totalCost = 0;

  feedbackItems.forEach(item => {
    const votes = voteCounts[item.id] || { upvotes: 0, downvotes: 0 };
    totalVotes += votes.upvotes - votes.downvotes;
    totalImportance += importanceScore[item.importance];
    totalAlignment += (item.businessAlignment / 5) * 100;
    totalCost += costScore[item.costEstimate];
  });

  const count = feedbackItems.length;
  const avgVotes = totalVotes / count;
  const avgImportance = totalImportance / count;
  const avgAlignment = totalAlignment / count;
  const avgCost = totalCost / count;

  // Normalize votes (scale -10 to 10 → 0 to 100)
  const normalizedVotes = Math.min(100, Math.max(0, (avgVotes + 10) / 20 * 100));

  const composite = 
    weights.votes * normalizedVotes +
    weights.importance * avgImportance +
    weights.alignment * avgAlignment +
    weights.cost * avgCost;

  return {
    composite: Math.round(composite),
    votes: Math.round(normalizedVotes),
    importance: Math.round(avgImportance),
    alignment: Math.round(avgAlignment),
    cost: Math.round(avgCost),
    feedbackCount: count,
  };
}

export function FeatureClusters({
  features,
  feedbackItems,
  voteCounts,
  weights,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
  onLinkFeedback,
}: FeatureClustersProps) {
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [newFeatureOpen, setNewFeatureOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Set<string>>(new Set());

  // Group feedback by feature
  const feedbackByFeature = useMemo(() => {
    const grouped: Record<string, FeedbackItem[]> = {};
    features.forEach(f => {
      grouped[f.id] = [];
    });
    feedbackItems.forEach(item => {
      if (item.featureId && grouped[item.featureId]) {
        grouped[item.featureId].push(item);
      }
    });
    return grouped;
  }, [features, feedbackItems]);

  // Unlinked feedback
  const unlinkedFeedback = useMemo(() => 
    feedbackItems.filter(item => !item.featureId),
    [feedbackItems]
  );

  // Calculate scores for each feature
  const featureScores = useMemo(() => {
    const scores: Record<string, AggregatedScore> = {};
    features.forEach(f => {
      scores[f.id] = calculateAggregatedScore(feedbackByFeature[f.id] || [], voteCounts, weights);
    });
    return scores;
  }, [features, feedbackByFeature, voteCounts, weights]);

  // Sort features by composite score
  const sortedFeatures = useMemo(() => 
    [...features].sort((a, b) => 
      (featureScores[b.id]?.composite || 0) - (featureScores[a.id]?.composite || 0)
    ),
    [features, featureScores]
  );

  const toggleExpanded = (id: string) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateFeature = async () => {
    if (!newTitle.trim()) return;
    await onAddFeature({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      status: 'exploring',
    });
    setNewTitle('');
    setNewDescription('');
    setNewFeatureOpen(false);
  };

  const handleLinkFeedback = async (featureId: string) => {
    for (const feedbackId of selectedFeedback) {
      await onLinkFeedback(feedbackId, featureId);
    }
    setSelectedFeedback(new Set());
    setLinkDialogOpen(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exploring': return 'bg-muted text-muted-foreground';
      case 'planned': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'in-progress': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'shipped': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Feature Clusters
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Link multiple feedback items to feature ideas. Scores are aggregated from all linked feedback.
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <Dialog open={newFeatureOpen} onOpenChange={setNewFeatureOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="w-4 h-4" />
                New Feature
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Feature Idea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Feature title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    placeholder="Describe the feature..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateFeature} className="w-full">
                  Create Feature
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedFeatures.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No features yet. Create one to start clustering feedback.</p>
          </div>
        ) : (
          sortedFeatures.map((feature) => {
            const score = featureScores[feature.id];
            const linkedFeedback = feedbackByFeature[feature.id] || [];
            const isExpanded = expandedFeatures.has(feature.id);

            return (
              <div 
                key={feature.id}
                className="border border-border/50 rounded-lg overflow-hidden"
              >
                {/* Feature Header */}
                <div 
                  className="flex items-center gap-3 p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpanded(feature.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{feature.title}</h4>
                      <Badge variant="outline" className={cn("text-xs", getStatusColor(feature.status))}>
                        {feature.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    {feature.description && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {feature.description}
                      </p>
                    )}
                  </div>

                  {/* Aggregated Score */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-lg font-bold text-primary">{score.composite}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {score.feedbackCount} feedback
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-3 space-y-3 border-t border-border/50">
                    {/* Score Breakdown */}
                    {score.feedbackCount > 0 && (
                      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-muted/50">
                        <div className="bg-chart-1" style={{ width: `${score.votes * weights.votes}%` }} />
                        <div className="bg-chart-2" style={{ width: `${score.importance * weights.importance}%` }} />
                        <div className="bg-chart-3" style={{ width: `${score.alignment * weights.alignment}%` }} />
                        <div className="bg-chart-4" style={{ width: `${score.cost * weights.cost}%` }} />
                      </div>
                    )}

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select
                        value={feature.status}
                        onValueChange={(value) => onUpdateFeature(feature.id, { status: value as Feature['status'] })}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FEATURE_STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Dialog open={linkDialogOpen === feature.id} onOpenChange={(open) => {
                        setLinkDialogOpen(open ? feature.id : null);
                        if (!open) setSelectedFeedback(new Set());
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                            <Link2 className="w-3.5 h-3.5" />
                            Link Feedback
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Link Feedback to "{feature.title}"</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[400px] pr-4">
                            <div className="space-y-2">
                              {unlinkedFeedback.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  All feedback is already linked to features.
                                </p>
                              ) : (
                                unlinkedFeedback.map(item => (
                                  <label
                                    key={item.id}
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={selectedFeedback.has(item.id)}
                                      onCheckedChange={(checked) => {
                                        setSelectedFeedback(prev => {
                                          const next = new Set(prev);
                                          if (checked) {
                                            next.add(item.id);
                                          } else {
                                            next.delete(item.id);
                                          }
                                          return next;
                                        });
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm">{item.content}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">{item.theme}</Badge>
                                        <Badge variant="secondary" className="text-xs">{item.importance}</Badge>
                                      </div>
                                    </div>
                                  </label>
                                ))
                              )}
                            </div>
                          </ScrollArea>
                          {unlinkedFeedback.length > 0 && (
                            <Button 
                              onClick={() => handleLinkFeedback(feature.id)}
                              disabled={selectedFeedback.size === 0}
                              className="w-full"
                            >
                              Link {selectedFeedback.size} Feedback Item{selectedFeedback.size !== 1 ? 's' : ''}
                            </Button>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => onDeleteFeature(feature.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Linked Feedback List */}
                    {linkedFeedback.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Linked Feedback
                        </h5>
                        {linkedFeedback.map(item => (
                          <div 
                            key={item.id}
                            className="flex items-center gap-2 p-2 rounded bg-background border border-border/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{item.content}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-xs">{item.theme}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {voteCounts[item.id]?.upvotes || 0} votes
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => onLinkFeedback(item.id, undefined)}
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Unlinked Feedback Count */}
        {unlinkedFeedback.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {unlinkedFeedback.length} feedback item{unlinkedFeedback.length !== 1 ? 's' : ''} not linked to any feature
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
