import { FC, useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Ketik pesan...',
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        100
      ) + 'px';
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="whatsapp-input-container">
      <button
        className="whatsapp-input-action"
        disabled={disabled}
        aria-label="Lampiran"
        title="Lampiran (belum aktif)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 19.8-4.3M22 5.5a10 10 0 0 1-19.8 4.2" />
        </svg>
      </button>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="whatsapp-input"
        rows={1}
      />

      {hasText ? (
        <button
          onClick={handleSend}
          disabled={disabled}
          className="whatsapp-send-btn"
          aria-label="Kirim pesan"
          title="Kirim (Enter atau Ctrl+Enter)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,0.9 1.77946707,1.4130651 C0.994623095,2.03866991 0.837654326,3.0812544 1.15159189,3.86674135 L3.03521743,10.3077344 C3.03521743,10.4648317 3.19218622,10.5719291 3.50612381,10.5719291 L16.6915026,11.3574160 C16.6915026,11.3574160 17.1624089,11.3574160 17.1624089,10.8443509 L17.1624089,12.0031798 C17.1624089,12.5162450 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
          </svg>
        </button>
      ) : (
        <button
          className="whatsapp-mic-btn"
          disabled={disabled}
          aria-label="Rekam suara"
          title="Rekam suara (belum aktif)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 16.91c-1.48 1.46-3.51 2.36-5.77 2.36-2.26 0-4.29-.9-5.77-2.36M19 12h2c0 2.96-1.23 5.73-3.22 7.68M3 12h2c0-2.96 1.23-5.73 3.22-7.68" />
          </svg>
        </button>
      )}
    </div>
  );
};
