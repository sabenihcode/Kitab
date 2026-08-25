import type { BabData } from '@types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
}

/**
 * Call Cohere API langsung (tanpa SDK)
 */
export const askCohere = async (
  userMessage: string,
  babData: BabData,
  chatHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_COHERE_API_KEY;

    if (!apiKey) {
      throw new Error('VITE_COHERE_API_KEY not configured');
    }

    // Build context
    const kitabContext = `
BAB ${babData.id}: ${babData.judul_id}
Ringkasan: ${babData.khulasah}

Konten (5 paragraf pertama):
${babData.paragraf
  .slice(0, 5)
  .map((p) => `- [${p.tipe}] ${p.terjemah.substring(0, 150)}...`)
  .join('\n')}
`;

    const systemPrompt = `Kamu adalah asisten belajar kitab Bustanul Arifin karya Imam An-Nawawi.

Tugas:
1. Jawab HANYA berdasarkan konten bab "${babData.judul_id}"
2. Gunakan bahasa Indonesia santai, relatable untuk anak muda
3. Jelaskan istilah dengan bahasa sederhana
4. Berikan insight praktis
5. Jika di luar topik, redirect ke bab

Konteks:
${kitabContext}`;

    // Format chat history
    const chatHistoryFormatted = chatHistory.map((msg) => ({
      role: msg.role === 'user' ? 'USER' : 'CHATBOT',
      message: msg.message,
    }));

    // Call Cohere API
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        chat_history: chatHistoryFormatted,
        model: 'command-light-nightly',
        preamble: systemPrompt,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Cohere API error:', error);

      if (response.status === 401) {
        throw new Error('🔑 API Key tidak valid');
      }
      if (response.status === 429) {
        throw new Error('⏱️ Terlalu banyak request, tunggu sebentar');
      }
      if (response.status === 400) {
        throw new Error('❌ Format request tidak valid');
      }

      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.text) {
      throw new Error('Tidak ada response dari AI');
    }

    return data.text;
  } catch (error) {
    console.error('Cohere error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi error';
    throw new Error(message);
  }
};

/**
 * Validate Cohere config
 */
export const validateCohereConfig = (): boolean => {
  return !!import.meta.env.VITE_COHERE_API_KEY;
};
