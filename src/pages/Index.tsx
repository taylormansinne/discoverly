import { useState, useMemo, useRef } from 'react';
import { useFeedback } from '@/hooks/useFeedback';
import { FeedbackForm } from '@/components/FeedbackForm';
import { FeedbackCard } from '@/components/FeedbackCard';
import { FeedbackFilters } from '@/components/FeedbackFilters';
import { StatsOverview } from '@/components/StatsOverview';
import { FeedbackAnalytics } from '@/components/FeedbackAnalytics';
import { PatternAnalytics } from '@/components/PatternAnalytics';
import { FeedbackImport } from '@/components/FeedbackImport';
import { FeedbackItem, Importance, CostEstimate } from '@/types/feedback';
import { BarChart3, Inbox } from 'lucide-react';

const importanceOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const costOrder = { low: 0, medium: 1, high: 2, 'very-high': 3 };

const Index = () => {
  const { items, addFeedback, deleteFeedback, updateFeedback } = useFeedback();
  
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

    // Quick Wins: low cost + (high/critical importance OR alignment >= 4)
    if (quickWinsOnly) {
      result = result.filter(i => 
        i.costEstimate === 'low' && 
        (i.importance === 'critical' || i.importance === 'high' || i.businessAlignment >= 4)
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Feedback Analyzer</h1>
              <p className="text-sm text-muted-foreground">Organize and prioritize user feedback</p>
            </div>
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
              {filteredAndSorted.length === 0 ? (
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
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <PatternAnalytics items={items} />
          <FeedbackAnalytics items={items} />
        </div>
      </main>
    </div>
  );
};

export default Index;
