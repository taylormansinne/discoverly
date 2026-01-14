import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ScoringWeights {
  votes: number;
  importance: number;
  alignment: number;
  cost: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  votes: 0.30,
  importance: 0.25,
  alignment: 0.25,
  cost: 0.20,
};

export function useScoringPreferences() {
  const { user } = useAuth();
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user preferences
  useEffect(() => {
    async function fetchPreferences() {
      if (!user) {
        setWeights(DEFAULT_WEIGHTS);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_scoring_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching scoring preferences:', error);
          setWeights(DEFAULT_WEIGHTS);
        } else if (data) {
          setWeights({
            votes: Number(data.votes_weight),
            importance: Number(data.importance_weight),
            alignment: Number(data.alignment_weight),
            cost: Number(data.cost_weight),
          });
        } else {
          setWeights(DEFAULT_WEIGHTS);
        }
      } catch (error) {
        console.error('Error fetching scoring preferences:', error);
        setWeights(DEFAULT_WEIGHTS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreferences();
  }, [user]);

  // Save preferences
  const saveWeights = useCallback(async (newWeights: ScoringWeights) => {
    if (!user) return false;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_scoring_preferences')
        .upsert({
          user_id: user.id,
          votes_weight: newWeights.votes,
          importance_weight: newWeights.importance,
          alignment_weight: newWeights.alignment,
          cost_weight: newWeights.cost,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error saving scoring preferences:', error);
        return false;
      }

      setWeights(newWeights);
      return true;
    } catch (error) {
      console.error('Error saving scoring preferences:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    return saveWeights(DEFAULT_WEIGHTS);
  }, [saveWeights]);

  return {
    weights,
    isLoading,
    isSaving,
    saveWeights,
    resetToDefaults,
    isAuthenticated: !!user,
    DEFAULT_WEIGHTS,
  };
}
