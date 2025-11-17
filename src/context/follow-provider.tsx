
'use client';

import type { Expert } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';

interface FollowContextType {
  followedExperts: Expert[];
  toggleFollow: (expert: Expert) => void;
  isFollowing: (id: string) => boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

const FOLLOW_STORAGE_KEY_PREFIX = 'cura-followed';

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const [followedExperts, setFollowedExperts] = useState<Expert[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const getStorageKey = useCallback(() => {
    return user ? `${FOLLOW_STORAGE_KEY_PREFIX}-${user.id}` : null;
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
        setFollowedExperts([]); // Clear follows if no user
        return;
    }
    try {
      const storedFollows = localStorage.getItem(storageKey);
      if (storedFollows) {
        setFollowedExperts(JSON.parse(storedFollows));
      } else {
        setFollowedExperts([]);
      }
    } catch (error) {
      console.error('Failed to parse followed experts from localStorage', error);
      const key = getStorageKey();
      if(key) localStorage.removeItem(key);
    }
  }, [user, getStorageKey]);

  const isFollowing = (id: string) => {
    return followedExperts.some((expert) => expert.id === id);
  };

  const toggleFollow = (expert: Expert) => {
    const storageKey = getStorageKey();
    if (!storageKey) {
        toast({ variant: 'destructive', title: 'You must be logged in to follow experts.' });
        return;
    }

    let updatedFollows: Expert[];
    const isAlreadyFollowing = isFollowing(expert.id);

    if (isAlreadyFollowing) {
      updatedFollows = followedExperts.filter((e) => e.id !== expert.id);
      toast({
        title: 'Unfollowed',
        description: `You are no longer following ${expert.name}.`,
        duration: 3000,
      });
    } else {
      updatedFollows = [...followedExperts, expert];
      toast({
        title: 'Followed',
        description: `You are now following ${expert.name}.`,
        duration: 3000,
      });
    }

    setFollowedExperts(updatedFollows);
    localStorage.setItem(storageKey, JSON.stringify(updatedFollows));
  };

  const value = {
    followedExperts,
    toggleFollow,
    isFollowing,
  };

  return (
    <FollowContext.Provider value={value}>{children}</FollowContext.Provider>
  );
}

export function useFollow() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
}
