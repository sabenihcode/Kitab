import type { QuizData } from '@/types';

const BASE_URL = '/data/quiz';

const isValidParagrafId = (paragrafId: string): boolean => /^p\d+$/.test(paragrafId);

/**
 * Memuat data quiz dari file JSON berdasarkan bab dan paragraf.
 */
export const loadQuizData = async (
  babId: number,
  paragrafId: string,
): Promise<QuizData> => {
  if (!Number.isInteger(babId) || babId < 1) {
    throw new Error(`ID bab tidak valid: ${babId}`);
  }

  if (!isValidParagrafId(paragrafId)) {
    throw new Error(`ID paragraf tidak valid: ${paragrafId}`);
  }

  const paddedBabId = String(babId).padStart(2, '0');
  const paragrafNumber = paragrafId.slice(1).padStart(2, '0');
  const url = `${BASE_URL}/bab-${paddedBabId}/paragraf-${paragrafNumber}.json`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Quiz untuk paragraf ini belum tersedia');
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Invalid content type: ${contentType}. Expected JSON.`);
  }

  const data = (await response.json()) as QuizData;

  if (
    data.babId !== babId ||
    data.paragrafId !== paragrafId ||
    !data.title ||
    !Array.isArray(data.questions) ||
    data.questions.length === 0
  ) {
    throw new Error('Struktur data quiz tidak valid');
  }

  for (const question of data.questions) {
    if (
      !question.id ||
      !question.word ||
      !question.question ||
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      !Number.isInteger(question.correctAnswer) ||
      question.correctAnswer < 0 ||
      question.correctAnswer >= question.options.length
    ) {
      throw new Error(`Struktur pertanyaan quiz tidak valid: ${question.id || 'unknown'}`);
    }
  }

  return data;
};
