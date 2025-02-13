export function sanitizeMarkdownContent(content: string): string {
  return content
    // Remove XML-style tags like <...>
    .replace(/<[^>]+>/g, '')
    // Remove markdown bold syntax
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove markdown italic syntax
    .replace(/\*(.*?)\*/g, '$1')
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
// sanitizeMarkdownContent("*害羞*, 其实呢...**温柔地笑了笑**") 
// Returns: "其实呢..."