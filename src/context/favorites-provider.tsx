'use client';

import type { ClinicalTrial, Publication, Expert } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';

export type FavoriteItemType = 'trial' | 'publication' | 'expert';
export type FavoriteItem =
  | { type: 'trial'; item: ClinicalTrial }
  | { type: 'publication'; item: Publication }
  | { type: 'expert'; item: Expert };

interface FavoritesContextType {
  favorites: FavoriteItem[];
  toggleFavorite: (
    item: ClinicalTrial | Publication | Expert,
    type: FavoriteItemType
  ) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const FAVORITES_KEY_PREFIX = 'cura-favorites';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const getStorageKey = useCallback(() => {
    return user ? `${FAVORITES_KEY_PREFIX}-${user.id}` : null;
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setFavorites([]); // Clear favorites if no user
      return;
    }
    try {
      const storedFavorites = localStorage.getItem(storageKey);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Failed to parse favorites from localStorage', error);
      const key = getStorageKey();
      if(key) localStorage.removeItem(key);
    }
  }, [user, getStorageKey]);

  const isFavorite = (id: string) => {
    return favorites.some((fav) => fav.item.id === id);
  };

  const toggleFavorite = (
    item: ClinicalTrial | Publication | Expert,
    type: FavoriteItemType
  ) => {
    const storageKey = getStorageKey();
    if (!storageKey) {
        toast({ variant: 'destructive', title: 'You must be logged in to save favorites.' });
        return;
    }

    let updatedFavorites: FavoriteItem[];
    const favoriteExists = isFavorite(item.id);

    if (favoriteExists) {
      updatedFavorites = favorites.filter((fav) => fav.item.id !== item.id);
      toast({
        variant: 'destructive',
        title: 'Removed from Favorites',
        description: `${(item as any).title || (item as Expert).name} has been removed.`,
      });
    } else {
      updatedFavorites = [...favorites, { type, item }];
      toast({
        title: 'Added to Favorites',
        description: `${(item as any).title || (item as Expert).name} has been saved.`,
      });
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem(storageKey, JSON.stringify(updatedFavorites));
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
