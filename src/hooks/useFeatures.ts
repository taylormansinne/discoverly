import { useState, useCallback, useEffect } from 'react';
import { Feature } from '@/types/feature';
import { supabase } from '@/integrations/supabase/client';

export function useFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeatures = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load features:', error);
        return;
      }

      const mapped: Feature[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        status: item.status as Feature['status'],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      setFeatures(mapped);
    } catch (e) {
      console.error('Failed to load features:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const addFeature = useCallback(async (feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('features')
      .insert({
        title: feature.title,
        description: feature.description || null,
        status: feature.status,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add feature:', error);
      return null;
    }

    const newFeature: Feature = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      status: data.status as Feature['status'],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    setFeatures(prev => [newFeature, ...prev]);
    return newFeature;
  }, []);

  const updateFeature = useCallback(async (id: string, updates: Partial<Feature>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description || null;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('features')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Failed to update feature:', error);
      return;
    }

    setFeatures(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates, updatedAt: new Date() } : f
    ));
  }, []);

  const deleteFeature = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('features')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete feature:', error);
      return;
    }

    setFeatures(prev => prev.filter(f => f.id !== id));
  }, []);

  return { features, loading, addFeature, updateFeature, deleteFeature, refresh: loadFeatures };
}
