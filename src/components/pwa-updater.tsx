'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdater() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        setRegistration(reg);

        // Check for updates every 60 seconds
        const interval = setInterval(() => {
          reg.update();
        }, 60 * 1000);

        // Listen for new service worker waiting to activate
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              setShowUpdate(true);
            }
          });
        });

        return () => clearInterval(interval);
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });

    // Reload when the new SW takes over
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage('SKIP_WAITING');
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg">
        <RefreshCw className="h-5 w-5 text-[#3B7EF4] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Update available</p>
          <p className="text-xs text-muted-foreground">A new version of openQuire is ready.</p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={handleUpdate} className="text-white" style={{
            background: 'linear-gradient(to top right, #3B7EF4, #96D9A5)'
          }}>
            Update
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowUpdate(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
