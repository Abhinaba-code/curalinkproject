
'use client';

import type { User, StoredUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockPublications } from '@/lib/data';
import { mockExperts } from '@/lib/data';
import { useAuditLog } from './audit-log-provider';

type ProfileData = Partial<Omit<User, 'id' | 'email' | 'role' | 'avatarUrl'>>;


interface AuthContextType {
  user: User | null;
  signup: (email: string, password: string, role: 'patient' | 'researcher') => Promise<void>;
  login: (email: string, password: string, role: 'patient' | 'researcher') => Promise<User | null>;
  logout: () => void;
  updateUserProfile: (profileData: ProfileData) => Promise<void>;
  updateWalletBalance: (newBalance: number) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'cura-users-db';
const CURRENT_USER_KEY = 'cura-user';
const FAVORITES_KEY_PREFIX = 'cura-favorites';
const FOLLOW_STORAGE_KEY_PREFIX = 'cura-followed';
const POSTS_KEY = 'cura-posts';
const NOTIFICATIONS_KEY = 'cura-notifications';
const ANNOUNCEMENTS_KEY_PREFIX = 'cura-announcements';
const SYMPTOMS_KEY_PREFIX = 'cura-symptoms';


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // This effect runs only once on mount to initialize the user state.
    let isMounted = true;
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) {
          if (isMounted) setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem(CURRENT_USER_KEY);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const getUsers = (): StoredUser[] => {
    try {
      const users = localStorage.getItem(USERS_DB_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Failed to parse users DB from localStorage', error);
      return [];
    }
  };
  
  const setUsers = (users: StoredUser[]) => {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }

  const signup = async (email: string, password: string, role: 'patient' | 'researcher') => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => { // Simulate network delay
        const users = getUsers();
        if (users.find(u => u.email === email)) {
          return reject(new Error('An account with this email already exists.'));
        }
        
        const newUser: StoredUser = {
          id: `usr_${Date.now()}`,
          email,
          password, // In a real app, this should be hashed
          name: email.split('@')[0],
          role,
          avatarUrl: `https://picsum.photos/seed/${email}/200/200`,
          walletBalance: 0, // Starting balance set to 0
          isPremium: false,
          notificationSettings: {
            newTrials: true,
            forumActivity: false,
            newsletter: true,
          }
        };
  
        users.push(newUser);
        setUsers(users);
  
        const { password: _, ...userToStore } = newUser;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
        setUser(userToStore);
  
        // Add default favorites for new users
        const defaultFavorites = [
          { type: 'publication', item: mockPublications[0] },
          { type: 'expert', item: mockExperts[0] }
        ];
        localStorage.setItem(`${FAVORITES_KEY_PREFIX}-${newUser.id}`, JSON.stringify(defaultFavorites));
  
        if (role === 'patient') {
          router.push('/dashboard/create-profile');
        } else {
          router.push('/dashboard/create-researcher-profile');
        }
        resolve();
      }, 500);
    });
  };

  const login = async (email: string, password: string, role: 'patient' | 'researcher') => {
    return new Promise<User | null>((resolve) => {
      const users = getUsers();
      const foundUser = users.find(u => u.email === email);

      if (!foundUser || foundUser.role !== role || foundUser.password !== password) {
        return resolve(null);
      }
      
      const { password: _, ...userToStore } = foundUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
      setUser(userToStore);
      router.push('/dashboard');
      resolve(userToStore);
    });
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    router.push('/');
  };
  
  const updateUserProfile = async (profileData: ProfileData) => {
    return new Promise<void>((resolve, reject) => {
      if (!user) {
        return reject(new Error('No user is currently logged in.'));
      }
  
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
  
      if (userIndex === -1) {
        return reject(new Error('Could not find user to update.'));
      }
  
      // Update the user in the "database"
      const updatedUserDB = { ...users[userIndex], ...profileData };
      users[userIndex] = updatedUserDB;
      setUsers(users);
  
      // Update the current user in state and localStorage
      const { password, ...userToStore } = updatedUserDB;
      setUser(userToStore);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
      
      resolve();
    });
  };
  
  const updateWalletBalance = async (newBalance: number) => {
      if (!user) return;
      await updateUserProfile({ walletBalance: newBalance });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!user) {
        return reject(new Error("No user is currently logged in."));
      }

      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);

      if (userIndex === -1) {
        return reject(new Error("Could not find user."));
      }

      const userFromDb = users[userIndex];
      if (userFromDb.password !== currentPassword) {
        return reject(new Error("The current password you entered is incorrect."));
      }
      
      // Update password in the "database"
      users[userIndex].password = newPassword;
      setUsers(users);

      resolve();
    });
  };

  const deleteAccount = async () => {
    return new Promise<void>((resolve, reject) => {
        if (!user) {
            return reject(new Error("No user is currently logged in."));
        }

        const userId = user.id;

        // 1. Remove user from the users "DB"
        const users = getUsers();
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);

        // 2. Clear all associated data from localStorage
        localStorage.removeItem(`${FAVORITES_KEY_PREFIX}-${userId}`);
        localStorage.removeItem(`${FOLLOW_STORAGE_KEY_PREFIX}-${userId}`);
        localStorage.removeItem(`${ANNOUNCEMENTS_KEY_PREFIX}-${userId}`);
        localStorage.removeItem(`${SYMPTOMS_KEY_PREFIX}-${userId}`);
        localStorage.removeItem(`cura-audit-log-${userId}`);
        
        // Example of removing user-specific posts/notifications (more complex logic might be needed)
        try {
            const posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
            const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
            
            const filteredPosts = posts.filter((p: any) => p.author.id !== userId);
            const filteredNotifications = notifications.filter((n: any) => n.authorId !== userId && n.recipientId !== userId);

            localStorage.setItem(POSTS_KEY, JSON.stringify(filteredPosts));
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filteredNotifications));
        } catch (e) {
            console.error("Error clearing user data from posts/notifications", e);
        }
        
        // 3. Log the user out
        logout();

        resolve();
    });
  };

  const value = { user, signup, login, logout, updateUserProfile, updateWalletBalance, changePassword, deleteAccount, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
