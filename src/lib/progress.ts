import { useCallback, useEffect, useState } from 'preact/hooks';

const STORAGE_PREFIX = 'study-progress:';

function readStoredIds(storageKey: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function writeStoredIds(storageKey: string, ids: Set<string>): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(storageKey, JSON.stringify([...ids]));
}

export function useProgress(cert: string, section: string) {
  const storageKey = `${STORAGE_PREFIX}${cert}:${section}`;
  const [completed, setCompleted] = useState<Set<string>>(() => readStoredIds(storageKey));

  useEffect(() => {
    setCompleted(readStoredIds(storageKey));
  }, [storageKey]);

  const isComplete = useCallback((id: string) => completed.has(id), [completed]);

  const setItemComplete = useCallback(
    (id: string, done: boolean) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (done) next.add(id);
        else next.delete(id);
        writeStoredIds(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  const toggle = useCallback((id: string) => setItemComplete(id, !completed.has(id)), [completed, setItemComplete]);

  const reset = useCallback(() => {
    writeStoredIds(storageKey, new Set());
    setCompleted(new Set());
  }, [storageKey]);

  return {
    completedIds: completed,
    completedCount: completed.size,
    isComplete,
    setItemComplete,
    toggle,
    reset,
  };
}
