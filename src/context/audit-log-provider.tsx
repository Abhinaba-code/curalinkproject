
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';

export type AuditLogActivityType = 'auth' | 'change' | 'security';

export interface AuditLogItem {
  id: string;
  activity: string;
  details: string;
  ip: string;
  timestamp: string;
  type: AuditLogActivityType;
}

interface AuditLogContextType {
  auditLogs: AuditLogItem[];
  addAuditLog: (item: Omit<AuditLogItem, 'id' | 'timestamp' | 'ip'>) => void;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

const AUDIT_LOG_KEY_PREFIX = 'cura-audit-log';
const MAX_LOG_ITEMS = 50;

export function AuditLogProvider({ children, user }: { children: React.ReactNode, user: User | null }) {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const getStorageKey = useCallback(() => {
    return user ? `${AUDIT_LOG_KEY_PREFIX}-${user.id}` : null;
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setAuditLogs([]);
      return;
    }
    try {
      const storedLogs = localStorage.getItem(storageKey);
      if (storedLogs) {
        setAuditLogs(JSON.parse(storedLogs));
      } else {
        setAuditLogs([]);
      }
    } catch (e) {
      console.error('Failed to load audit logs from localStorage', e);
      if (storageKey) localStorage.removeItem(storageKey);
    }
  }, [getStorageKey]);
  
  const addAuditLog = useCallback((item: Omit<AuditLogItem, 'id' | 'timestamp' | 'ip'>) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    const newLog: AuditLogItem = {
      ...item,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ip: '192.168.1.1', // Mock IP for demonstration
    };

    setAuditLogs(currentLogs => {
        const updatedLogs = [newLog, ...currentLogs].slice(0, MAX_LOG_ITEMS);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updatedLogs));
        } catch (e) {
            console.error('Failed to save audit logs to localStorage', e);
        }
        return updatedLogs;
    });

  }, [getStorageKey]);

  const value = { auditLogs, addAuditLog };

  return (
    <AuditLogContext.Provider value={value}>{children}</AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (context === undefined) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
}
