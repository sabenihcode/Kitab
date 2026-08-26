import type { BabData } from '@types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
}

// Daftar model dengan fallback
const CANDIDATE_MODELS = [
  'command-r-08-2024',              // ✅ PRIMARY
  'command-a-plus-05-2026',         // ✅ FALLBACK 1
  'command-a-reasoning-08-2025',    // ✅ FALLBACK 2
  'command-a-translate-08-2025',    // ✅ FALLBACK 3
  'command-r-plus-08-2024',         // ✅ FALLBACK 4
  'command-r7b-12-2024',            // ✅ FALLBACK 5
];

/**
 * Call Cohere API dengan automatic model fallback
 */
export const askCohere = async (
  userMessage: string,
  babData: BabData,
  chatHistory: ChatMessage[] = []
): Promise<string> => {
  const apiKey = import.meta.env.VITE_COHERE_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_COHERE_API_KEY tidak dikonfigurasi');
  }

  // Build context dari bab
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

  // Format chat history untuk Cohere API
  const chatHistoryFormatted = chatHistory.map((msg) => ({
    role: msg.role === 'user' ? 'USER' : 'CHATBOT',
    message: msg.message,
  }));

  // Coba models dengan fallback
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`🔄 Mencoba model: ${model}`);

      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chat_history: chatHistoryFormatted,
          model: model,
          preamble: systemPrompt,
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data?.message || `HTTP ${response.status}`;

        // Handle authentication errors
        if (
          response.status === 401 ||
          errorMsg.toLowerCase().includes('invalid api key')
        ) {
          throw new Error('🔑 API Key Cohere AI tidak valid atau expired');
        }

        // Handle model not found / deprecated (auto-fallback)
        if (
          response.status === 404 ||
          errorMsg.toLowerCase().includes('removed') ||
          errorMsg.toLowerCase().includes('deprecated') ||
          errorMsg.toLowerCase().includes('not found')
        ) {
          console.warn(`⚠️ Model ${model} tidak tersedia, mencoba model lain...`);
          lastError = new Error(`Model ${model}: ${errorMsg}`);
          continue; // Lanjut ke model berikutnya
        }

        throw new Error(`API Error: ${errorMsg}`);
      }

      if (!data.text) {
        throw new Error('Tidak ada response dari AI');
      }

      console.log(`✅ Berhasil menggunakan model: ${model}`);
      return data.text;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);

      // Jika auth error, throw langsung
      if (msg.includes('API Key') || msg.includes('tidak valid')) {
        throw error;
      }

      // Simpan error untuk fallback
      lastError = error;
      console.warn(`❌ Error dengan ${model}: ${msg}`);
      // Lanjut ke model berikutnya
    }
  }

  // Semua model gagal
  const finalMsg =
    lastError instanceof Error
      ? lastError.message
      : 'Gagal menghubungi Cohere AI setelah mencoba semua model';

  throw new Error(`🚫 ${finalMsg}`);
};

/**
 * Validate Cohere config
 */
export const validateCohereConfig = (): boolean => {
  return !!import.meta.env.VITE_COHERE_API_KEY;
};
