import { FC, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { BabData } from '../../types';

interface ChatSheetProps {
  babData: BabData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSheet: FC<ChatSheetProps> = ({ babData, isOpen, onClose }) => {
  const { messages, loading, error, sendMessage } = useChat(babData);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <div>
            <h3 className="chat-title">Tanya AI</h3>
            <p className="chat-subtitle">
              {babData?.judul_id || 'Pilih bab terlebih dahulu'}
            </p>
          </div>
          <button className="chat-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} role={msg.role} message={msg.message} />
          ))}
          {loading && (
            <div className="chat-loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          {error && <div className="chat-error">{error}</div>}
        </div>

        <ChatInput
          onSend={sendMessage}
          disabled={loading || !babData}
          placeholder={babData ? 'Tanya sesuatu...' : 'Pilih bab dulu'}
        />
      </div>
    </div>
  );
};