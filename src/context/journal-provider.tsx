
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { useToast } from '@/hooks/use-toast';

export interface JournalEntry {
  id: string;
  notes: string;
  mood: number;
  pain: number;
  sleep: number;
  energy: number;
  date: string;
  symptoms?: string[];
  medications?: string[];
  activities?: string[];
  diet?: string;
}

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  deleteEntry: (id: string) => void;
  clearJournal: () => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

const JOURNAL_STORAGE_KEY_PREFIX = 'cura-journal';

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const getStorageKey = useCallback(() => {
    return user ? `${JOURNAL_STORAGE_KEY_PREFIX}-${user.id}` : null;
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setEntries([]);
      return;
    }
    try {
      const storedEntries = localStorage.getItem(storageKey);
      if (storedEntries) {
        const parsedEntries: JournalEntry[] = JSON.parse(storedEntries);
        parsedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(parsedEntries);
      } else {
        setEntries([]);
      }
    } catch (e) {
      console.error('Failed to load journal entries from localStorage', e);
      if (storageKey) localStorage.removeItem(storageKey);
    }
  }, [getStorageKey]);

  const updateJournalStorage = (newEntries: JournalEntry[]) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    setEntries(newEntries);
    localStorage.setItem(storageKey, JSON.stringify(newEntries));
  };

  const addEntry = (entryData: Omit<JournalEntry, 'id' | 'date'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `journal-${Date.now()}`,
      date: new Date().toISOString(),
    };
    const updatedEntries = [newEntry, ...entries];
    updateJournalStorage(updatedEntries);
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter((e) => e.id !== id);
    updateJournalStorage(updatedEntries);
    toast({
      variant: 'destructive',
      title: 'Journal Entry Deleted',
      description: 'The entry has been removed from your journal.',
    });
  };
  
  const clearJournal = () => {
    updateJournalStorage([]);
     toast({
      variant: 'destructive',
      title: 'Journal Cleared',
      description: 'All entries have been removed from your journal.',
    });
  }

  const value = { entries, addEntry, deleteEntry, clearJournal };

  return (
    <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}
