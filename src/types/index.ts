export type TipeParagraf = 'matan' | 'ayat' | 'hadits' | 'atsar';

export interface Paragraf {
  id: string;
  tipe: TipeParagraf;
  teks_ar: string;
  terjemah: string;
  referensi?: string;
  rawi?: string;
}

export interface BabData {
  id: number;
  judul_ar: string;
  judul_id: string;
  paragraf: Paragraf[];
  khulasah: string;
}

export interface DaftarIsi {
  id: number;
  judul_ar: string;
  judul_id: string;
  tersedia: boolean;
}

export interface KitabMetadata {
  judul_ar: string;
  judul_id: string;
  pengarang: string;
  total_bab: number;
  kategori: string;
}

export interface Metadata {
  kitab: KitabMetadata;
  daftar_isi: DaftarIsi[];
}