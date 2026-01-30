/**
 * Offline-first sync: onlaynda API dan ma'lumot olib local DB ga yozamiz.
 */
import { getDb } from '@/lib/db/database';
import { getAccountData } from '@/lib/api/client';
import type { SeededData } from '@/lib/db/seed';

const LAST_SYNC_KEY = 'finance_last_sync_at';

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

export function getLastSyncAt(): Date | null {
  if (typeof window === 'undefined') return null;
  const s = localStorage.getItem(LAST_SYNC_KEY);
  if (!s) return null;
  const t = new Date(s).getTime();
  return isNaN(t) ? null : new Date(t);
}

export function setLastSyncAt(date: Date): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_SYNC_KEY, date.toISOString());
}

/** Onlaynda API dan ma'lumot olib local DB ga yozadi (pull sync). */
export async function pullFromServer(): Promise<SeededData | null> {
  if (typeof window === 'undefined') return null;
  if (!isOnline()) return null;
  const data = await getAccountData();
  if (!data || !data.wallets?.length) return null;
  const db = getDb();
  try {
    await db.wallets.clear();
    await db.categories.clear();
    await db.transactions.clear();
    await db.debts.clear();
    await db.wallets.bulkAdd(data.wallets);
    await db.categories.bulkAdd(data.categories);
    await db.transactions.bulkAdd(data.transactions);
    await db.debts.bulkAdd(data.debts);
    setLastSyncAt(new Date());
    if (process.env.NODE_ENV === 'development') {
      console.log('[sync] pullFromServer ok', data.wallets.length, 'wallets');
    }
    return data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('[sync] pullFromServer failed', err);
    return null;
  }
}
