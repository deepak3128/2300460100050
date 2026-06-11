import { useState, useCallback } from "react";

const STORAGE_KEY = "read_notification_ids";

export function useReadNotifications() {
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const persist = (ids: Set<string>) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch {}
  };

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set([...prev, id]);
      persist(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const next = new Set([...prev, ...ids]);
      persist(next);
      return next;
    });
  }, []);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  return { markAsRead, markAllAsRead, isRead };
}