
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';

export type ActivityType = 'trial_search' | 'publication_search' | 'expert_search' | 'global_search';

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

const HISTORY_STORAGE_KEY_PREFIX = 'cura-history';

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const getStorageKey = useCallback(() => {
    return user ? `${HISTORY_STORAGE_KEY_PREFIX}-${user.id}` : null;
  }, [user]);


  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
        setHistory([]); // Clear history if no user is logged in
        return;
    }
    try {
      const storedHistory = localStorage.getItem(storageKey);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to parse history from localStorage', error);
      const key = getStorageKey();
      if(key) localStorage.removeItem(key);
    }
  }, [user, getStorageKey]);

  const updateHistoryStorage = (newHistory: HistoryItem[]) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    setHistory(newHistory);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
  };
  
  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory(currentHistory => {
        const newItem: HistoryItem = {
            ...item,
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        
        if (currentHistory[0]?.query === newItem.query && currentHistory[0]?.type === newItem.type) {
            return currentHistory;
        }

        const newHistory = [newItem, ...currentHistory];
        
        const storageKey = getStorageKey();
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(newHistory));
        }

        return newHistory;
    });
  }, [getStorageKey]);

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
