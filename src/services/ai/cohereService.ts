import { CohereClient } from 'cohere-ai';
import type { BabData } from '../../types';

const client = new CohereClient({
  token: import.meta.env.VITE_COHERE_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';  // internal naming
  message: string;
}

export const askCohere = async (
  userMessage: string,
  babData: BabData,
  chatHistory: ChatMessage[] = []
): Promise<string> => {
  const kitabContext = `
BAB ${babData.id}: ${babData.judul_id}
Ringkasan: ${babData.khulasah}

Konten Paragraf (5 pertama):
${babData.paragraf.slice(0, 5).map(p => `- [${p.tipe}] ${p.terjemah.substring(0, 200)}`).join('\n')}
`;

  const systemPrompt = `Kamu adalah asisten belajar kitab Bustanul Arifin karya Imam An-Nawawi.

Tugas kamu:
1. Jawab pertanyaan HANYA berdasarkan konten bab "${babData.judul_id}"
2. Gunakan bahasa Indonesia santai, relatable untuk anak muda
3. Jelaskan istilah kitab dengan bahasa sederhana
4. Kasih insight praktis untuk kehidupan sehari-hari
5. Kalau di luar topik, redirect halus ke topik bab

Konteks Kitab:
${kitabContext}
`;

  try {
    const cohereChatHistory = chatHistory.map(msg => ({
      role: msg.role === 'user' ? ('USER' as const) : ('CHATBOT' as const),
      message: msg.message,
    }));

    const response = await client.chat({
      message: userMessage,
      chatHistory: cohereChatHistory,
      model: 'command-a-03-2025',
      preamble: systemPrompt,
      temperature: 0.8,
      maxTokens: 500,
    });

    return response.text;
  } catch (error) {
    console.error('Cohere Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('API key tidak valid. Cek .env.local');
      }
      if (error.message.includes('429')) {
        throw new Error('Rate limit tercapai. Tunggu sebentar ya.');
      }
      if (error.message.includes('400')) {
        throw new Error('Format pesan tidak valid. Refresh halaman.');
      }
      if (error.message.includes('model')) {
        throw new Error('Model AI sedang update. Coba lagi nanti.');
      }
    }
    
    throw new Error('Gagal terhubung ke AI. Coba lagi nanti.');
  }
};