export function sanitizeMarkdownContent(content: string): string {
  return content
    // Remove custom XML-style tags with any name
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '')
    .replace(/<(\w+)>[\s\S]*?<\/\1>/g, '')
    // Remove self-closing tags
    .replace(/<[^>]+\/>/g, '')
    // Remove remaining XML-style tags
    .replace(/<[^>]+>/g, '')
    // Remove markdown bold and italic combinations (***text***)
    .replace(/\*{3}(.*?)\*{3}/g, '')
    // Remove markdown bold (**text**)
    .replace(/\*{2}(.*?)\*{2}/g, '')
    // Remove markdown italic (*text*)
    .replace(/\*(.*?)\*/g, '')
    // Remove markdown code blocks
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    // Remove inline code
    .replace(/`(.*?)`/g, '$1')
    // Trim whitespace and clean up punctuation
    .trim()
    .replace(/\s{2,}/g, ' ')
    .replace(/(\S)[，。]?$/, '$1');
}

// Example usage:
// sanitizeMarkdownContent("<think>有什么好害羞的呀～</think>其实呢...") 
// Returns: "其实呢..."
// sanitizeMarkdownContent("<custom>remove this</custom>keep this") // Returns: "keep this"
// sanitizeMarkdownContent("***remove*** **remove** *remove* keep") // Returns: "keep"