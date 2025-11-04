'use client';

import type { User, ClinicalTrial, Publication, Expert } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type FavoriteItemType = 'trial' | 'publication' | 'expert';
type FavoriteItem =
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
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('cura-favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to parse favorites from localStorage', error);
      localStorage.removeItem('cura-favorites');
    }
  }, []);

  const isFavorite = (id: string) => {
    return favorites.some((fav) => fav.item.id === id);
  };

  const toggleFavorite = (
    item: ClinicalTrial | Publication | Expert,
    type: FavoriteItemType
  ) => {
    let updatedFavorites: FavoriteItem[];
    const favoriteExists = isFavorite(item.id);

    if (favoriteExists) {
      updatedFavorites = favorites.filter((fav) => fav.item.id !== item.id);
      toast({
        title: 'Removed from Favorites',
        description: `${item.title || (item as Expert).name} has been removed.`,
      });
    } else {
      updatedFavorites = [...favorites, { type, item }];
      toast({
        title: 'Added to Favorites',
        description: `${item.title || (item as Expert).name} has been saved.`,
      });
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('cura-favorites', JSON.stringify(updatedFavorites));
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    showFavorites,
    setShowFavorites,
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
