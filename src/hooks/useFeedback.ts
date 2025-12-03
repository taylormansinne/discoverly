import { useState, useCallback } from 'react';
import { FeedbackItem } from '@/types/feedback';

const STORAGE_KEY = 'feedback-items';

const loadFromStorage = (): FeedbackItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored);
      return items.map((item: FeedbackItem) => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
    }
  } catch (e) {
    console.error('Failed to load feedback from storage', e);
  }
  return [];
};

const saveToStorage = (items: FeedbackItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save feedback to storage', e);
  }
};

export function useFeedback() {
  const [items, setItems] = useState<FeedbackItem[]>(loadFromStorage);

  const addFeedback = useCallback((item: Omit<FeedbackItem, 'id' | 'createdAt'>) => {
    const newItem: FeedbackItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setItems(prev => {
      const updated = [newItem, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteFeedback = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateFeedback = useCallback((id: string, updates: Partial<FeedbackItem>) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

  return { items, addFeedback, deleteFeedback, updateFeedback };
}
