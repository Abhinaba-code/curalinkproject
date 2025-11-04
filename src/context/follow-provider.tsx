'use client';

import type { Expert } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FollowContextType {
  followedExperts: Expert[];
  toggleFollow: (expert: Expert) => void;
  isFollowing: (id: string) => boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

const FOLLOW_STORAGE_KEY = 'cura-followed';

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const [followedExperts, setFollowedExperts] = useState<Expert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFollows = localStorage.getItem(FOLLOW_STORAGE_KEY);
      if (storedFollows) {
        setFollowedExperts(JSON.parse(storedFollows));
      }
    } catch (error) {
      console.error('Failed to parse followed experts from localStorage', error);
      localStorage.removeItem(FOLLOW_STORAGE_KEY);
    }
  }, []);

  const isFollowing = (id: string) => {
    return followedExperts.some((expert) => expert.id === id);
  };

  const toggleFollow = (expert: Expert) => {
    let updatedFollows: Expert[];
    const isAlreadyFollowing = isFollowing(expert.id);

    if (isAlreadyFollowing) {
      updatedFollows = followedExperts.filter((e) => e.id !== expert.id);
      toast({
        title: 'Unfollowed',
        description: `You are no longer following ${expert.name}.`,
      });
    } else {
      updatedFollows = [...followedExperts, expert];
      toast({
        title: 'Followed',
        description: `You are now following ${expert.name}.`,
      });
    }

    setFollowedExperts(updatedFollows);
    localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(updatedFollows));
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
