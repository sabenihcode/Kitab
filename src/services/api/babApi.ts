import type { BabData, Metadata } from '@/types';

const BASE_URL = '/data';

/**
 * Load metadata dari file JSON
 */
export const loadMetadata = async (): Promise<Metadata> => {
  try {
    const url = `${BASE_URL}/metadata.json`;
    console.log('Loading metadata from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Invalid content type: ${contentType}. Expected JSON.`);
    }

    const data = await response.json();
    
    // Validasi struktur
    if (!data.kitab || !Array.isArray(data.daftar_isi)) {
      throw new Error('Metadata structure is invalid');
    }

    return data;
  } catch (error) {
    console.error('Error loading metadata:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to load metadata');
  }
};

/**
 * Load data bab dari file JSON
 */
export const loadBabData = async (babId: number): Promise<BabData> => {
  try {
    // Validasi input
    if (!Number.isInteger(babId) || babId < 1 || babId > 99) {
      throw new Error(`Invalid bab ID: ${babId}`);
    }

    // Format dengan padding: 1 -> 01, 2 -> 02, etc
    const paddedId = String(babId).padStart(2, '0');
    const url = `${BASE_URL}/bab/${paddedId}.json`;
    
    console.log('Loading bab from:', url);
    
    const response = await fetch(url);
    
    // Handle 404 atau error lainnya
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Bab ${babId} belum tersedia (file not found)`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Validasi content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(
        `Invalid content type: ${contentType}. ` +
        `Expected JSON. Got HTML instead - file may be missing or misconfigured.`
      );
    }

    // Parse JSON
    let data: BabData;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(
        `Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      );
    }

    // Validasi struktur data
    if (!data.id || !data.judul_ar || !data.judul_id) {
      throw new Error('Bab data structure is invalid - missing required fields');
    }

    if (!Array.isArray(data.paragraf) || data.paragraf.length === 0) {
      throw new Error('Bab has no paragraf or paragraf is invalid');
    }

    return data;
  } catch (error) {
    console.error(`Error loading bab ${babId}:`, error);
    throw error instanceof Error 
      ? error 
      : new Error(`Failed to load bab ${babId}`);
  }
};

/**
 * Get semua bab yang tersedia
 */
export const getAvailableBabs = async () => {
  try {
    const metadata = await loadMetadata();
    return metadata.daftar_isi.filter(bab => bab.tersedia);
  } catch (error) {
    console.error('Error getting available babs:', error);
    return [];
  }
};

/**
 * Check apakah bab tersedia
 */
export const isBabAvailable = async (babId: number): Promise<boolean> => {
  try {
    const metadata = await loadMetadata();
    return metadata.daftar_isi.some(
      bab => bab.id === babId && bab.tersedia
    );
  } catch (error) {
    console.error('Error checking bab availability:', error);
    return false;
  }
};