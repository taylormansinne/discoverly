import { useState, useEffect } from 'react';
import { ScoringWeights, useScoringPreferences } from '@/hooks/useScoringPreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, RotateCcw, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface ScoringSettingsPanelProps {
  onWeightsChange?: (weights: ScoringWeights) => void;
}

export function ScoringSettingsPanel({ onWeightsChange }: ScoringSettingsPanelProps) {
  const { 
    weights, 
    isLoading, 
    isSaving, 
    saveWeights, 
    resetToDefaults, 
    isAuthenticated,
    DEFAULT_WEIGHTS 
  } = useScoringPreferences();

  const [localWeights, setLocalWeights] = useState<ScoringWeights>(weights);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local weights when weights change from the hook
  useEffect(() => {
    setLocalWeights(weights);
  }, [weights]);

  // Notify parent of weight changes
  useEffect(() => {
    onWeightsChange?.(localWeights);
  }, [localWeights, onWeightsChange]);

  // Check if we have unsaved changes
  useEffect(() => {
    const changed = 
      localWeights.votes !== weights.votes ||
      localWeights.importance !== weights.importance ||
      localWeights.alignment !== weights.alignment ||
      localWeights.cost !== weights.cost;
    setHasChanges(changed);
  }, [localWeights, weights]);

  const handleWeightChange = (key: keyof ScoringWeights, value: number) => {
    // Calculate remaining weight to distribute
    const oldValue = localWeights[key];
    const diff = value - oldValue;
    
    // Get other keys
    const otherKeys = (Object.keys(localWeights) as Array<keyof ScoringWeights>).filter(k => k !== key);
    const otherTotal = otherKeys.reduce((sum, k) => sum + localWeights[k], 0);
    
    if (otherTotal === 0) return;
    
    // Proportionally adjust other weights
    const newWeights = { ...localWeights };
    newWeights[key] = value;
    
    otherKeys.forEach(k => {
      const proportion = localWeights[k] / otherTotal;
      newWeights[k] = Math.max(0, Math.min(1, localWeights[k] - (diff * proportion)));
    });
    
    // Ensure weights sum to 1
    const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.01) {
      const adjustment = (1 - sum) / otherKeys.length;
      otherKeys.forEach(k => {
        newWeights[k] = Math.max(0, Math.min(1, newWeights[k] + adjustment));
      });
    }
    
    setLocalWeights(newWeights);
  };

  const handleSave = async () => {
    const success = await saveWeights(localWeights);
    if (success) {
      toast.success('Scoring weights saved');
    } else {
      toast.error('Failed to save weights');
    }
  };

  const handleReset = async () => {
    setLocalWeights(DEFAULT_WEIGHTS);
    if (isAuthenticated) {
      const success = await resetToDefaults();
      if (success) {
        toast.success('Weights reset to defaults');
      }
    }
  };

  const weightLabels: Record<keyof ScoringWeights, { label: string; color: string }> = {
    votes: { label: 'Votes', color: 'bg-chart-1' },
    importance: { label: 'Importance', color: 'bg-chart-2' },
    alignment: { label: 'Business Alignment', color: 'bg-chart-3' },
    cost: { label: 'Cost Efficiency', color: 'bg-chart-4' },
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Scoring Weights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Scoring Weights
          </CardTitle>
          {!isAuthenticated && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              Login to save
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight Preview Bar */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Weight distribution</p>
          <div className="flex h-3 rounded-full overflow-hidden">
            {(Object.keys(weightLabels) as Array<keyof ScoringWeights>).map((key) => (
              <div
                key={key}
                className={`${weightLabels[key].color} transition-all duration-200`}
                style={{ width: `${localWeights[key] * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Weight Sliders */}
        <div className="space-y-5">
          {(Object.keys(weightLabels) as Array<keyof ScoringWeights>).map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${weightLabels[key].color}`} />
                  <span className="text-sm font-medium">{weightLabels[key].label}</span>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {Math.round(localWeights[key] * 100)}%
                </span>
              </div>
              <Slider
                value={[localWeights[key] * 100]}
                onValueChange={([value]) => handleWeightChange(key, value / 100)}
                max={80}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          {isAuthenticated && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="gap-1.5 ml-auto"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>

        {/* Note about defaults */}
        <p className="text-xs text-muted-foreground">
          Default: Votes (30%), Importance (25%), Alignment (25%), Cost (20%)
        </p>
      </CardContent>
    </Card>
  );
}
