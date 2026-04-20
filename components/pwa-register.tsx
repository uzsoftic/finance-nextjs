'use client';

import { useEffect } from 'react';

/** Registers service worker. Sync from API only when local DB is empty (see store initialize). */
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

  // Onlayn bo‘lganda lokal ma’lumotni API bilan almashtirmaymiz – faqat bo‘sh DB ni to‘ldiramiz initialize da. Shuning uchun bu yerdan pullFromServer chaqirmaymiz (Accounts yo‘qolmasin).
  // Kelajakda haqiqiy backend bo‘lsa, sync queue (push) va merge logikasi qo‘shiladi.

  return null;
}
