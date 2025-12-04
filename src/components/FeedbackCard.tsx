import { useState } from 'react';
import { FeedbackItem, THEMES, IMPORTANCE_OPTIONS, COST_OPTIONS, SOURCE_OPTIONS, Importance, BusinessAlignment, CostEstimate } from '@/types/feedback';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Trash2, Calendar, Tag, DollarSign, Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackCardProps {
  item: FeedbackItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FeedbackItem>) => void;
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

export function FeedbackCard({ item, onDelete, onUpdate }: FeedbackCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    content: item.content,
    theme: item.theme,
    importance: item.importance,
    businessAlignment: item.businessAlignment,
    costEstimate: item.costEstimate,
    source: item.source || ''
  });

  const handleSave = () => {
    onUpdate(item.id, {
      content: editData.content.trim(),
      theme: editData.theme,
      importance: editData.importance,
      businessAlignment: editData.businessAlignment,
      costEstimate: editData.costEstimate,
      source: editData.source.trim() || undefined
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      content: item.content,
      theme: item.theme,
      importance: item.importance,
      businessAlignment: item.businessAlignment,
      costEstimate: item.costEstimate,
      source: item.source || ''
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-primary/30 shadow-md">
        <CardContent className="p-4 space-y-4">
          <Textarea
            value={editData.content}
            onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
            className="min-h-[80px] resize-none"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={editData.theme} onValueChange={(v) => setEditData(prev => ({ ...prev, theme: v }))}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={editData.importance} onValueChange={(v) => setEditData(prev => ({ ...prev, importance: v as Importance }))}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMPORTANCE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={editData.costEstimate} onValueChange={(v) => setEditData(prev => ({ ...prev, costEstimate: v as CostEstimate }))}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COST_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEditData(prev => ({ ...prev, businessAlignment: n as BusinessAlignment }))}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      'w-5 h-5 transition-colors',
                      n <= editData.businessAlignment
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <Select value={editData.source || ''} onValueChange={(v) => setEditData(prev => ({ ...prev, source: v }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Source (optional)" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!editData.content.trim() || !editData.theme}>
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
