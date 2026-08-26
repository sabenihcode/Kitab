import { marked } from 'marked';

// Configure marked untuk output clean
marked.setOptions({
  breaks: true,        // Line break jadi <br>
  gfm: true,           // GitHub Flavored Markdown
});

/**
 * Convert markdown to clean HTML
 * - Strip **bold** (ganti dengan span styled)
 * - Parse numbered lists
 * - Parse line breaks
 * Output: clean text tanpa bintang
 */
export const formatAIMessage = (text: string): string => {
  // Parse markdown ke HTML
  const html = marked.parse(text) as string;
  
  // Clean up: ganti <strong> dengan span biasa (no bold visual)
  const cleaned = html
    .replace(/<strong>(.*?)<\/strong>/g, '<span class="ai-emphasis">$1</span>')
    .replace(/<em>(.*?)<\/em>/g, '<span class="ai-emphasis">$1</span>')
    .replace(/\*\*(.*?)\*\*/g, '<span class="ai-emphasis">$1</span>')
    .replace(/__(.*?)__/g, '<span class="ai-emphasis">$1</span>');
  
  return cleaned;
};
