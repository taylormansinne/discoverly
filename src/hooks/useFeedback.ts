import { useState, useCallback, useEffect } from 'react';
import { FeedbackItem } from '@/types/feedback';
import { supabase } from '@/integrations/supabase/client';

export function useFeedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load feedback from database
  const loadFeedback = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load feedback:', error);
        return;
      }

      const mapped: FeedbackItem[] = (data || []).map(item => ({
        id: item.id,
        content: item.content,
        theme: item.theme,
        importance: item.importance as FeedbackItem['importance'],
        businessAlignment: item.business_alignment as FeedbackItem['businessAlignment'],
        costEstimate: item.cost_estimate as FeedbackItem['costEstimate'],
        createdAt: new Date(item.created_at),
        source: item.source || undefined,
        proposalLink: item.proposal_link || undefined,
        persona: item.persona || undefined,
        productArea: item.product_area || undefined,
      }));

      setItems(mapped);
    } catch (e) {
      console.error('Failed to load feedback:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const addFeedback = useCallback(async (item: Omit<FeedbackItem, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('feedback_items')
      .insert({
        content: item.content,
        theme: item.theme,
        importance: item.importance,
        business_alignment: item.businessAlignment,
        cost_estimate: item.costEstimate,
        source: item.source || null,
        proposal_link: item.proposalLink || null,
        persona: item.persona || null,
        product_area: item.productArea || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add feedback:', error);
      return;
    }

    const newItem: FeedbackItem = {
      id: data.id,
      content: data.content,
      theme: data.theme,
      importance: data.importance as FeedbackItem['importance'],
      businessAlignment: data.business_alignment as FeedbackItem['businessAlignment'],
      costEstimate: data.cost_estimate as FeedbackItem['costEstimate'],
      createdAt: new Date(data.created_at),
      source: data.source || undefined,
      proposalLink: data.proposal_link || undefined,
      persona: data.persona || undefined,
      productArea: data.product_area || undefined,
    };

    setItems(prev => [newItem, ...prev]);
  }, []);

  const deleteFeedback = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('feedback_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete feedback:', error);
      return;
    }

    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateFeedback = useCallback(async (id: string, updates: Partial<FeedbackItem>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    if (updates.importance !== undefined) dbUpdates.importance = updates.importance;
    if (updates.businessAlignment !== undefined) dbUpdates.business_alignment = updates.businessAlignment;
    if (updates.costEstimate !== undefined) dbUpdates.cost_estimate = updates.costEstimate;
    if (updates.source !== undefined) dbUpdates.source = updates.source || null;
    if (updates.proposalLink !== undefined) dbUpdates.proposal_link = updates.proposalLink || null;
    if (updates.persona !== undefined) dbUpdates.persona = updates.persona || null;
    if (updates.productArea !== undefined) dbUpdates.product_area = updates.productArea || null;

    const { error } = await supabase
      .from('feedback_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Failed to update feedback:', error);
      return;
    }

    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  return { items, loading, addFeedback, deleteFeedback, updateFeedback, refresh: loadFeedback };
}
