'use client';

import { useEffect } from 'react';
import { pullFromServer } from '@/lib/sync/sync';
import { useFinanceStore } from '@/lib/store';

/** Registers service worker and syncs when back online. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((reg) => {
        if (process.env.NODE_ENV === 'development') console.log('[PWA] SW registered', reg.scope);
      })
      .catch((err) => console.warn('[PWA] SW registration failed', err));
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      pullFromServer().then((data) => {
        if (!data) return;
        const get = useFinanceStore.getState();
        get.loadWallets();
        get.loadTransactions();
        get.loadCategories();
        get.loadDebts();
      });
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return null;
}
