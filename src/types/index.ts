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

export interface QuizQuestion {
  id: string;
  word: string;
  displayWord?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizData {
  babId: number;
  paragrafId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
}
