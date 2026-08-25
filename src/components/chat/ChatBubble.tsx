import { FC } from 'react';
import { formatAIMessage } from '../../utils/formatMessage';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  message: string;
}

export const ChatBubble: FC<ChatBubbleProps> = ({ role, message }) => {
  if (role === 'user') {
    return (
      <div className="chat-bubble user">
        <p className="chat-bubble-text">{message}</p>
      </div>
    );
  }

  // Assistant: format markdown
  const html = formatAIMessage(message);
  
  return (
    <div className="chat-bubble assistant">
      <p 
        className="chat-bubble-text" 
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  );
};