'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type ActivityType = 'trial_search' | 'publication_search' | 'expert_search';

export interface HistoryItem {
  id: string;
  type: ActivityType;
  query: string;
  timestamp: string;
  link: string;
}

interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'cura-history';

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse history from localStorage', error);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  const updateHistoryStorage = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  };
  
  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    // Avoid adding duplicate consecutive searches
    if (history[0]?.query === newItem.query && history[0]?.type === newItem.type) {
      return;
    }

    const newHistory = [newItem, ...history];
    updateHistoryStorage(newHistory);
  }, [history]);

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    updateHistoryStorage(newHistory);
    toast({
      title: 'Activity Removed',
      description: 'The selected activity has been removed from your history.',
    });
  };

  const clearHistory = () => {
    updateHistoryStorage([]);
    toast({
      title: 'History Cleared',
      description: 'All of your activity history has been removed.',
    });
  };

  const value = {
    history,
    addHistoryItem,
    deleteHistoryItem,
clearHistory,
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
