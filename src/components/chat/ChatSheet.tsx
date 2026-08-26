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
    <div className="whatsapp-overlay" onClick={onClose}>
      <div className="whatsapp-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="whatsapp-header">
          <div className="whatsapp-header-back">
            <button 
              className="whatsapp-back-btn" 
              onClick={onClose}
              aria-label="Tutup chat"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>

          <div className="whatsapp-header-info">
            <div className="whatsapp-avatar-sm">S</div>
            <div>
              <h3 className="whatsapp-header-title">Sabenih AI</h3>
              <p className="whatsapp-header-status">Online</p>
            </div>
          </div>

          <div className="whatsapp-header-actions">
            <button 
              className="whatsapp-header-action"
              aria-label="Informasi"
              title="Informasi"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="whatsapp-messages" ref={chatBoxRef}>
          {messages.length === 0 && !loading && (
            <div className="whatsapp-empty-state">
              <div className="whatsapp-empty-icon">S</div>
              <h4 className="whatsapp-empty-title">Sabenih AI</h4>
              <p className="whatsapp-empty-text">
                Tanya sesuatu tentang {babData?.judul_id || 'bab ini'}
              </p>
              <p className="whatsapp-empty-subtext">
                Mulai percakapan dengan mengajukan pertanyaan
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatBubble key={idx} role={msg.role} message={msg.message} />
          ))}

          {loading && (
            <div className="whatsapp-bubble whatsapp-bubble-assistant">
              <div className="whatsapp-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {error && (
            <div className="whatsapp-error-message">
              <span className="whatsapp-error-icon">!</span>
              <div>
                <p className="whatsapp-error-title">Terjadi kesalahan</p>
                <p className="whatsapp-error-text">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          disabled={loading || !babData}
          placeholder={babData ? 'Ketik pesan...' : 'Pilih bab dulu'}
        />
      </div>
    </div>
  );
};
