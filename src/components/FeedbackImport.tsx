import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FeedbackItem, Importance, BusinessAlignment, CostEstimate, THEMES, SOURCE_OPTIONS } from '@/types/feedback';
import { Upload, FileJson, FileText } from 'lucide-react';

interface FeedbackImportProps {
  onImport: (items: Omit<FeedbackItem, 'id' | 'createdAt'>[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackImport({ onImport, isOpen, onClose }: FeedbackImportProps) {
  const [source, setSource] = useState<string>('Jira');
  const [rawInput, setRawInput] = useState('');
  const { toast } = useToast();

  const parseJiraFormat = (text: string): Omit<FeedbackItem, 'id' | 'createdAt'>[] => {
    // Expected format: one item per line, fields separated by | 
    // content | theme | importance | alignment | cost
    const lines = text.trim().split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      const content = parts[0] || 'Imported feedback';
      const theme = THEMES.includes(parts[1] as any) ? parts[1] : 'Other';
      const importance = (['critical', 'high', 'medium', 'low'].includes(parts[2]) ? parts[2] : 'medium') as Importance;
      const alignment = Math.min(5, Math.max(1, parseInt(parts[3]) || 3)) as BusinessAlignment;
      const cost = (['low', 'medium', 'high', 'very-high'].includes(parts[4]) ? parts[4] : 'medium') as CostEstimate;

      const proposalLink = parts[5]?.trim() || undefined;
      return { content, theme, importance, businessAlignment: alignment, costEstimate: cost, source, proposalLink };
    });
  };

  const parseJsonFormat = (text: string): Omit<FeedbackItem, 'id' | 'createdAt'>[] => {
    try {
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      
      return items.map(item => ({
        content: item.content || item.summary || item.description || 'Imported feedback',
        theme: THEMES.includes(item.theme) ? item.theme : 'Other',
        importance: (['critical', 'high', 'medium', 'low'].includes(item.importance) ? item.importance : 'medium') as Importance,
        businessAlignment: Math.min(5, Math.max(1, parseInt(item.businessAlignment || item.alignment) || 3)) as BusinessAlignment,
        costEstimate: (['low', 'medium', 'high', 'very-high'].includes(item.costEstimate || item.cost) ? (item.costEstimate || item.cost) : 'medium') as CostEstimate,
        source: item.source || source,
        proposalLink: item.proposalLink || item.link || undefined
      }));
    } catch {
      throw new Error('Invalid JSON format');
    }
  };

  const handleImport = () => {
    if (!rawInput.trim()) {
      toast({ title: 'No input', description: 'Please paste feedback data to import', variant: 'destructive' });
      return;
    }

    try {
      let parsed: Omit<FeedbackItem, 'id' | 'createdAt'>[];
      
      // Try JSON first, fallback to pipe-delimited
      if (rawInput.trim().startsWith('[') || rawInput.trim().startsWith('{')) {
        parsed = parseJsonFormat(rawInput);
      } else {
        parsed = parseJiraFormat(rawInput);
      }

      if (parsed.length === 0) {
        toast({ title: 'No items found', description: 'Could not parse any feedback items', variant: 'destructive' });
        return;
      }

      onImport(parsed);
      setRawInput('');
      onClose();
      toast({ title: 'Import successful', description: `Imported ${parsed.length} feedback item(s)` });
    } catch (error) {
      toast({ title: 'Import failed', description: 'Please check the format and try again', variant: 'destructive' });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Feedback
        </CardTitle>
        <CardDescription>
          Import from Jira, Zendesk, or paste JSON/CSV data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Source</Label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Paste Feedback Data</Label>
          <Textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`Paste JSON array or pipe-delimited lines:

JSON: [{"content": "...", "theme": "UX/UI", "importance": "high", "alignment": 4, "cost": "low", "proposalLink": "https://..."}]

Or pipe-delimited (one per line):
content | theme | importance | alignment | cost | proposalLink (optional)
User needs better search | Feature Request | high | 4 | medium | https://notion.so/...`}
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        <div className="flex gap-2 text-xs text-muted-foreground">
          <FileJson className="w-4 h-4" />
          <span>JSON or</span>
          <FileText className="w-4 h-4" />
          <span>content | theme | importance | alignment | cost | link</span>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleImport} className="flex-1">
            Import
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}