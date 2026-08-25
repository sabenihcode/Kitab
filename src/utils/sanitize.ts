import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export const formatAIMessage = (text: string): string => {
  const html = marked.parse(text) as string;
  
  // Strip ** markers tapi pertahankan text
  const cleaned = html
    .replace(/<strong>(.*?)<\/strong>/g, '<span class="ai-emphasis">$1</span>')
    .replace(/<em>(.*?)<\/em>/g, '<span class="ai-emphasis">$1</span>');
  
  // Sanitize untuk keamanan
  return DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: ['p', 'br', 'span', 'ol', 'ul', 'li', 'strong', 'em', 'code'],
    ALLOWED_ATTR: ['class'],
  });
};