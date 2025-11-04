'use client';

import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: 'patient' | 'researcher') => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('cura-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('cura-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string, role: 'patient' | 'researcher') => {
    // This is a mock login. In a real app, you'd get a JWT and user data from an API.
    const newUser: User = {
      id: 'usr_1',
      email,
      name: email.split('@')[0],
      role,
      avatarUrl: `https://picsum.photos/seed/${email}/200/200`,
    };
    localStorage.setItem('cura-user', JSON.stringify(newUser));
    setUser(newUser);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('cura-user');
    setUser(null);
    router.push('/auth/login');
  };

  const value = { user, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
