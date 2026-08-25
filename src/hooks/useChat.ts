import { useState, useCallback } from 'react';
import { askCohere, ChatMessage } from '../services/ai/cohereService';
import { BabData } from '../types';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  message: 'Halo! Ada yang mau dibahas seputar bab ini? Tanya aja, santai.',
};

export const useChat = (babData: BabData | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || !babData || loading) return;

      const userMsg: ChatMessage = { role: 'user', message: userMessage };
      const updatedMessages = [...messages, userMsg];

      setMessages(updatedMessages);
      setLoading(true);
      setError(null);

      try {
        const reply = await askCohere(userMessage, babData, messages);
        setMessages([...updatedMessages, { role: 'assistant', message: reply }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ada error');
        // Rollback user message on error
        setMessages(messages);
      } finally {
        setLoading(false);
      }
    },
    [messages, babData, loading]
  );

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearChat };
};