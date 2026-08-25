/**
 * Convert markdown-like text to clean HTML
 * Handles:
 * - **bold** → <strong>
 * - *italic* → <em>
 * - `code` → <code>
 * - Line breaks
 * - Lists
 */
export const formatAIMessage = (text: string): string => {
  if (!text) return '';

  let html = text
    // Escape HTML special chars first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text** atau __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* atau _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code: `text`
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Line breaks: \n → <br>
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    // Lists: - item → <li>
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    // Numbered lists: 1. item
    .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')
    // Wrap lists
    .replace(/(<li>.*?<\/li>)/s, (match) => `<ul>${match}</ul>`)
    // Wrap paragraphs
    .replace(/^([^<].*?)$/gm, (line) => {
      if (line.trim() && !line.startsWith('<')) {
        return `<p>${line}</p>`;
      }
      return line;
    });

  return html;
};
