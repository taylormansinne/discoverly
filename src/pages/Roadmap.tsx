import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFeedback } from '@/hooks/useFeedback';
import { useVotes } from '@/hooks/useVotes';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronUp, ChevronDown, Lightbulb, Clock, CheckCircle2, ArrowLeft, LogIn, LogOut, Tag, LayoutGrid, GanttChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import discoverlyLogo from '@/assets/discoverly-logo.png';
import { GanttTimeline } from '@/components/GanttTimeline';

type Status = 'idea' | 'planned' | 'released';

const statusConfig = {
  idea: { label: 'Ideas', icon: Lightbulb, color: 'bg-primary/10 text-primary border-primary/20' },
  planned: { label: 'Planned', icon: Clock, color: 'bg-warning/10 text-warning border-warning/20' },
  released: { label: 'Released', icon: CheckCircle2, color: 'bg-success/10 text-success border-success/20' },
};

export default function Roadmap() {
  const { items, loading, updateFeedback } = useFeedback();
  const { user, signOut } = useAuth();
  const feedbackIds = useMemo(() => items.map(i => i.id), [items]);
  const { voteCounts, vote } = useVotes(feedbackIds);
  const [viewMode, setViewMode] = useState<'board' | 'timeline'>('board');

  const handleVote = async (feedbackId: string, voteType: 1 | -1) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }
    const { error } = await vote(feedbackId, voteType);
    if (error) {
      toast.error('Failed to vote');
    }
  };

  const handleStatusChange = (feedbackId: string, newStatus: Status) => {
    updateFeedback(feedbackId, { status: newStatus } as any);
    toast.success(`Moved to ${statusConfig[newStatus].label}`);
  };

  const itemsByStatus = useMemo(() => {
    const grouped: Record<Status, typeof items> = { idea: [], planned: [], released: [] };
    items.forEach(item => {
      const status = ((item as any).status || 'idea') as Status;
      grouped[status].push(item);
    });
    // Sort by vote score within each group
    Object.keys(grouped).forEach(status => {
      grouped[status as Status].sort((a, b) => {
        const scoreA = (voteCounts[a.id]?.upvotes || 0) - (voteCounts[a.id]?.downvotes || 0);
        const scoreB = (voteCounts[b.id]?.upvotes || 0) - (voteCounts[b.id]?.downvotes || 0);
        return scoreB - scoreA;
      });
    });
    return grouped;
  }, [items, voteCounts]);

  const RoadmapCard = ({ item }: { item: typeof items[0] }) => {
    const counts = voteCounts[item.id] || { upvotes: 0, downvotes: 0, userVote: null };
    const score = counts.upvotes - counts.downvotes;
    const status = ((item as any).status || 'idea') as Status;

    return (
      <Card className="group border-border/50 hover:border-primary/20 transition-all">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Vote buttons */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  counts.userVote === 1 && 'text-success bg-success/10'
                )}
                onClick={() => handleVote(item.id, 1)}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <span className={cn(
                'text-sm font-semibold',
                score > 0 && 'text-success',
                score < 0 && 'text-destructive'
              )}>
                {score}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  counts.userVote === -1 && 'text-destructive bg-destructive/10'
                )}
                onClick={() => handleVote(item.id, -1)}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {item.theme}
                </Badge>
                {user && (
                  <Select value={status} onValueChange={(v) => handleStatusChange(item.id, v as Status)}>
                    <SelectTrigger className="h-6 w-auto px-2 text-xs border-none bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="released">Released</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <p className="text-sm text-foreground">{item.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={discoverlyLogo} alt="Discoverly" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Roadmap</h1>
                <p className="text-sm text-muted-foreground">Vote on ideas and track progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Feedback
                </Link>
              </Button>
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-1" />
                    Sign In
                  </Link>
                </Button>
              )}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'board' | 'timeline')} className="ml-4">
                <TabsList className="h-9">
                  <TabsTrigger value="board" className="gap-1.5 px-3">
                    <LayoutGrid className="w-4 h-4" />
                    Board
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="gap-1.5 px-3">
                    <GanttChart className="w-4 h-4" />
                    Timeline
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {viewMode === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['idea', 'planned', 'released'] as Status[]).map(status => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const statusItems = itemsByStatus[status];

              return (
                <div key={status} className="space-y-4">
                  <Card className={cn('border', config.color)}>
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Icon className="w-4 h-4" />
                        {config.label}
                        <Badge variant="secondary" className="ml-auto">
                          {statusItems.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <div className="space-y-3">
                    {statusItems.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        No items yet
                      </p>
                    ) : (
                      statusItems.map(item => (
                        <RoadmapCard key={item.id} item={item} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <GanttTimeline items={items} voteCounts={voteCounts} />
        )}
      </main>
    </div>
  );
}
