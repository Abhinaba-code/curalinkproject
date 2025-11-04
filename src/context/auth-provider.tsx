'use client';

import type { User, StoredUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockPublications } from '@/lib/data';
import { mockExperts } from '@/lib/data';

type ProfileData = Omit<User, 'id' | 'email' | 'role' | 'avatarUrl'>;

interface AuthContextType {
  user: User | null;
  signup: (email: string, password: string, role: 'patient' | 'researcher') => Promise<void>;
  login: (email: string, password: string, role: 'patient' | 'researcher') => Promise<void>;
  logout: () => void;
  updateUserProfile: (profileData: ProfileData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'cura-users-db';
const CURRENT_USER_KEY = 'cura-user';
const FAVORITES_KEY = 'cura-favorites';

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
      };

      users.push(newUser);
      setUsers(users);

      // Automatically log in the user after signup
      const { password: _, ...userToStore } = newUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
      setUser(userToStore);
      
      // Add default favorites for new users
      const defaultFavorites = [
        { type: 'publication', item: mockPublications[0] },
        { type: 'expert', item: mockExperts[0] }
      ];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(defaultFavorites));

      if (role === 'patient') {
        router.push('/dashboard/create-profile');
      } else {
        router.push('/dashboard');
      }
      resolve();
    });
  };

  const login = async (email: string, password: string, role: 'patient' | 'researcher') => {
    return new Promise<void>((resolve, reject) => {
      const users = getUsers();
      const foundUser = users.find(u => u.email === email);

      if (!foundUser) {
        return reject(new Error('No account found with this email.'));
      }

      if (foundUser.role !== role) {
        return reject(new Error(`This email is registered as a ${foundUser.role}, not a ${role}.`));
      }

      if (foundUser.password !== password) {
        // In a real app, use a secure comparison
        return reject(new Error('Incorrect password.'));
      }
      
      const { password: _, ...userToStore } = foundUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
      setUser(userToStore);
      router.push('/dashboard');
      resolve();
    });
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    router.push('/auth/login');
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
      const updatedUserDB = { ...users[userIndex], ...profileData, name: profileData.name || users[userIndex].name };
      users[userIndex] = updatedUserDB;
      setUsers(users);
  
      // Update the current user in state and localStorage
      const { password, ...userToStore } = updatedUserDB;
      setUser(userToStore);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
      
      resolve();
    });
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

  const value = { user, signup, login, logout, updateUserProfile, changePassword, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
