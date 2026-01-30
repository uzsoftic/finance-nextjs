'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isOnline, getLastSyncAt } from '@/lib/sync/sync';
import { formatDistanceToNow } from 'date-fns';

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    setOnline(isOnline());
    setLastSync(getLastSyncAt());
    const onOnline = () => {
      setOnline(true);
      setLastSync(getLastSyncAt());
    };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    const t = setInterval(() => setLastSync(getLastSyncAt()), 60_000);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearInterval(t);
    };
  }, []);

  if (online) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs text-muted-foreground',
          lastSync ? 'tabular-nums' : ''
        )}
        title={lastSync ? `Synced ${formatDistanceToNow(lastSync, { addSuffix: true })}` : undefined}
      >
        <Cloud className="h-3.5 w-3.5" />
        {lastSync ? formatDistanceToNow(lastSync, { addSuffix: true }) : '—'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400" title="Offline – changes save locally">
      <WifiOff className="h-3.5 w-3.5" />
      Offline
    </span>
  );
}
