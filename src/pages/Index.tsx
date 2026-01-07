import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFeedback } from '@/hooks/useFeedback';
import { useVotes } from '@/hooks/useVotes';
import { useFeatures } from '@/hooks/useFeatures';
import { FeedbackForm } from '@/components/FeedbackForm';
import { FeedbackCard } from '@/components/FeedbackCard';
import { FeedbackFilters } from '@/components/FeedbackFilters';
import { StatsOverview } from '@/components/StatsOverview';
import { FeedbackAnalytics } from '@/components/FeedbackAnalytics';
import { PatternAnalytics } from '@/components/PatternAnalytics';
import { PrioritizationDashboard } from '@/components/PrioritizationDashboard';
import { FeatureClusters } from '@/components/FeatureClusters';
import { FeedbackImport } from '@/components/FeedbackImport';
import { FeedbackItem } from '@/types/feedback';
import { Inbox, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import discoverlyLogo from '@/assets/discoverly-logo.png';

const importanceOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const costOrder = { low: 0, medium: 1, high: 2, 'very-high': 3 };

const Index = () => {
  const { items, loading, addFeedback, deleteFeedback, updateFeedback, refresh } = useFeedback();
  const feedbackIds = useMemo(() => items.map(i => i.id), [items]);
  const { voteCounts } = useVotes(feedbackIds);
  const { features, addFeature, updateFeature, deleteFeature } = useFeatures();

  const handleLinkFeedback = async (feedbackId: string, featureId: string | undefined) => {
    await updateFeedback(feedbackId, { featureId });
  };
  
  const [themeFilter, setThemeFilter] = useState('all');
  const [importanceFilter, setImportanceFilter] = useState('all');
  const [costFilter, setCostFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [quickWinsOnly, setQuickWinsOnly] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const importRef = useRef<HTMLDivElement>(null);

  const handleImportClick = () => {
    setShowImport(true);
    setTimeout(() => {
      importRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...items];

    // Quick Wins: critical/high importance OR alignment >= 4
    if (quickWinsOnly) {
      result = result.filter(i => 
        i.importance === 'critical' || 
        i.importance === 'high' || 
        i.businessAlignment >= 4
      );
    }

    if (themeFilter !== 'all') {
      result = result.filter(i => i.theme === themeFilter);
    }
    if (importanceFilter !== 'all') {
      result = result.filter(i => i.importance === importanceFilter);
    }
    if (costFilter !== 'all') {
      result = result.filter(i => i.costEstimate === costFilter);
    }

    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'importance':
        result.sort((a, b) => importanceOrder[a.importance] - importanceOrder[b.importance]);
        break;
      case 'alignment':
        result.sort((a, b) => b.businessAlignment - a.businessAlignment);
        break;
      case 'cost':
        result.sort((a, b) => costOrder[a.costEstimate] - costOrder[b.costEstimate]);
        break;
      default:
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return result;
  }, [items, themeFilter, importanceFilter, costFilter, sortBy, quickWinsOnly]);

  const clearFilters = () => {
    setThemeFilter('all');
    setImportanceFilter('all');
    setCostFilter('all');
    setQuickWinsOnly(false);
  };

  const handleBulkImport = (importedItems: Omit<FeedbackItem, 'id' | 'createdAt'>[]) => {
    importedItems.forEach(item => addFeedback(item));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={discoverlyLogo} alt="Discoverly" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Discoverly</h1>
                <p className="text-sm text-muted-foreground">Discover patterns in user feedback</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/roadmap">
                <Map className="w-4 h-4 mr-2" />
                Roadmap
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <FeedbackForm onSubmit={addFeedback} onImportClick={handleImportClick} />
            <div ref={importRef}>
              <FeedbackImport onImport={handleBulkImport} isOpen={showImport} onClose={() => setShowImport(false)} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <StatsOverview items={items} />

            <FeedbackFilters
              themeFilter={themeFilter}
              importanceFilter={importanceFilter}
              costFilter={costFilter}
              sortBy={sortBy}
              quickWinsOnly={quickWinsOnly}
              onThemeChange={setThemeFilter}
              onImportanceChange={setImportanceFilter}
              onCostChange={setCostFilter}
              onSortChange={setSortBy}
              onQuickWinsChange={setQuickWinsOnly}
              onClear={clearFilters}
            />

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm">Loading feedback...</p>
                </div>
              ) : filteredAndSorted.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No feedback yet</p>
                  <p className="text-sm">Add your first feedback item to get started</p>
                </div>
              ) : (
                filteredAndSorted.map(item => (
                  <FeedbackCard
                    key={item.id}
                    item={item}
                    onDelete={deleteFeedback}
                    onUpdate={updateFeedback}
                    voteCount={voteCounts[item.id]}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FeatureClusters
              features={features}
              feedbackItems={items}
              voteCounts={voteCounts}
              onAddFeature={addFeature}
              onUpdateFeature={updateFeature}
              onDeleteFeature={deleteFeature}
              onLinkFeedback={handleLinkFeedback}
            />
            <PrioritizationDashboard items={items} voteCounts={voteCounts} />
          </div>
          <div className="space-y-6">
            <PatternAnalytics items={items} />
            <FeedbackAnalytics items={items} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
