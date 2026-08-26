import { FC } from 'react';
import { formatAIMessage } from '../../utils/formatMessage';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  message: string;
}

export const ChatBubble: FC<ChatBubbleProps> = ({ role, message }) => {
  return (
    <div className={`whatsapp-bubble whatsapp-bubble-${role}`}>
      {role === 'user' ? (
        <p className="whatsapp-bubble-text">{message}</p>
      ) : (
        <p 
          className="whatsapp-bubble-text"
          dangerouslySetInnerHTML={{ __html: formatAIMessage(message) }} 
        />
      )}
      <span className="whatsapp-bubble-time">
        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};
