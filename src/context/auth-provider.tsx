'use client';

import type { User, StoredUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  signup: (email: string, password: string, role: 'patient' | 'researcher') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = 'cura-users-db';
const CURRENT_USER_KEY = 'cura-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem(CURRENT_USER_KEY);
    } finally {
      setLoading(false);
    }
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
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

      // Automatically log in the user after signup
      const { password: _, ...userToStore } = newUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
      setUser(userToStore);
      router.push('/dashboard');
      resolve();
    });
  };

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      const users = getUsers();
      const foundUser = users.find(u => u.email === email);

      if (!foundUser) {
        return reject(new Error('No account found with this email.'));
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

  const value = { user, signup, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
