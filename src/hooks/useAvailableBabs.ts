import { useState, useEffect } from 'react';
import { getAvailableBabs, isBabAvailable } from '../services/api/babApi';
import { DaftarIsi } from '../types';

export const useAvailableBabs = () => {
  const [babs, setBabs] = useState<DaftarIsi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBabs = async () => {
      try {
        setLoading(true);
        const availableBabs = await getAvailableBabs();
        setBabs(availableBabs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading babs');
        console.error('Error fetching available babs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBabs();
  }, []);

  const checkAvailable = async (babId: number): Promise<boolean> => {
    return await isBabAvailable(babId);
  };

  return {
    babs,
    loading,
    error,
    checkAvailable,
    isAvailable: (babId: number) => babs.some(b => b.id === babId && b.tersedia),
  };
};