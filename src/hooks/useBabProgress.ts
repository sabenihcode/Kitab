import { useState, useCallback } from 'react';
import { storage } from '@/services/storage/localStorage';

const STORAGE_KEY = 'selesai';

export const useBabProgress = () => {
  const [completed, setCompleted] = useState<number[]>(() =>
    storage.get<number[]>(STORAGE_KEY, [])
  );

  const toggleComplete = useCallback((babId: number) => {
    setCompleted((prev) => {
      const newCompleted = prev.includes(babId)
        ? prev.filter((id) => id !== babId)
        : [...prev, babId];
      storage.set(STORAGE_KEY, newCompleted);
      return newCompleted;
    });
  }, []);

  const isCompleted = useCallback(
    (babId: number) => completed.includes(babId),
    [completed]
  );

  const clearProgress = useCallback(() => {
    setCompleted([]);
    storage.remove(STORAGE_KEY);
  }, []);

  return { completed, toggleComplete, isCompleted, clearProgress };
};