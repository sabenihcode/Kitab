import { useState } from 'react';
import { storage } from '../services/storage/localStorage';

const STORAGE_KEY = 'user_profile';

interface UserProfile {
  name: string;
}

const DEFAULT_NAME = 'Santri';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(() =>
    storage.get<UserProfile>(STORAGE_KEY, { name: DEFAULT_NAME })
  );

  const updateName = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const newProfile = { name: trimmed };
    setProfile(newProfile);
    storage.set(STORAGE_KEY, newProfile);
    return true;
  };

  const resetName = (): void => {
    setProfile({ name: DEFAULT_NAME });
    storage.set(STORAGE_KEY, { name: DEFAULT_NAME });
  };

  return {
    profile,
    updateName,
    resetName,
    defaultName: DEFAULT_NAME,
  };
};