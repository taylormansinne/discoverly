import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackItem, THEMES, IMPORTANCE_OPTIONS, COST_OPTIONS, SOURCE_OPTIONS, Importance, BusinessAlignment, CostEstimate } from '@/types/feedback';
import { Plus, Star, Link, Upload } from 'lucide-react';

interface FeedbackFormProps {
  onSubmit: (item: Omit<FeedbackItem, 'id' | 'createdAt'>) => void;
  onImportClick?: () => void;
}

export function FeedbackForm({ onSubmit, onImportClick }: FeedbackFormProps) {
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<string>('');
  const [importance, setImportance] = useState<Importance>('medium');
  const [businessAlignment, setBusinessAlignment] = useState<BusinessAlignment>(3);
  const [costEstimate, setCostEstimate] = useState<CostEstimate>('medium');
  const [source, setSource] = useState('');
  const [proposalLink, setProposalLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !theme) return;

    onSubmit({
      content: content.trim(),
      theme,
      importance,
      businessAlignment,
      costEstimate,
      source: source.trim() || undefined,
      proposalLink: proposalLink.trim() || undefined
    });

    setContent('');
    setTheme('');
    setImportance('medium');
    setBusinessAlignment(3);
    setCostEstimate('medium');
    setSource('');
    setProposalLink('');
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Feedback
          </CardTitle>
          {onImportClick && (
            <Button variant="outline" size="sm" onClick={onImportClick} className="gap-1.5">
              <Upload className="w-4 h-4" />
              Import
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Feedback Content</Label>
            <Textarea
              id="content"
              placeholder="Describe the feedback..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="importance">Importance</Label>
              <Select value={importance} onValueChange={(v) => setImportance(v as Importance)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPORTANCE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Business Alignment</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setBusinessAlignment(n as BusinessAlignment)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        n <= businessAlignment
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Solution Cost</Label>
              <Select value={costEstimate} onValueChange={(v) => setCostEstimate(v as CostEstimate)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COST_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label} ({opt.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source (optional)</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposalLink" className="flex items-center gap-1">
                <Link className="w-3.5 h-3.5" />
                Proposal Link (optional)
              </Label>
              <Input
                id="proposalLink"
                type="url"
                placeholder="https://notion.so/... or Jira ticket URL"
                value={proposalLink}
                onChange={(e) => setProposalLink(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!content.trim() || !theme}>
            Add Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
