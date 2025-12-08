import { useState, useRef, DragEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FeedbackItem, Importance, BusinessAlignment, CostEstimate, SOURCE_OPTIONS } from '@/types/feedback';
import { Upload, FileText } from 'lucide-react';

interface FeedbackImportProps {
  onImport: (items: Omit<FeedbackItem, 'id' | 'createdAt'>[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackImport({ onImport, isOpen, onClose }: FeedbackImportProps) {
  const [source, setSource] = useState<string>('Jira');
  const [rawInput, setRawInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const parseSimpleText = (text: string): Omit<FeedbackItem, 'id' | 'createdAt'>[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    
    return lines.map(line => ({
      content: line.trim(),
      theme: 'Other',
      importance: 'medium' as Importance,
      businessAlignment: 3 as BusinessAlignment,
      costEstimate: 'medium' as CostEstimate,
      source
    }));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      setRawInput(prev => prev ? `${prev}\n${text}` : text);
    }
  };

  const handleImport = () => {
    if (!rawInput.trim()) {
      toast({ title: 'No input', description: 'Please paste or drag feedback to import', variant: 'destructive' });
      return;
    }

    const parsed = parseSimpleText(rawInput);

    if (parsed.length === 0) {
      toast({ title: 'No items found', description: 'Could not parse any feedback items', variant: 'destructive' });
      return;
    }

    onImport(parsed);
    setRawInput('');
    onClose();
    toast({ title: 'Import successful', description: `Imported ${parsed.length} feedback item(s). You can edit details inline.` });
  };

  if (!isOpen) return null;

  const itemCount = rawInput.trim().split('\n').filter(l => l.trim()).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Feedback
        </CardTitle>
        <CardDescription>
          Drag & drop or paste feedback - one item per line
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

        <div 
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
        >
          {!rawInput && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-muted-foreground">
              <FileText className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Drop feedback here or paste below</p>
              <p className="text-xs">One feedback item per line</p>
            </div>
          )}
          <Textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder=""
            className={`min-h-[150px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
              rawInput ? '' : 'text-transparent placeholder:text-transparent'
            }`}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Tip: Import feedback first, then edit theme, importance & cost inline
        </p>

        <div className="flex gap-2">
          <Button onClick={handleImport} className="flex-1">
            Import {itemCount > 0 ? `${itemCount} Item${itemCount > 1 ? 's' : ''}` : ''}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
