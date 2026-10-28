/**
 * Simple HTML formatter to pretty-print HTML for the Code View.
 * Adds newlines around block-level elements for better readability.
 */
export const formatHtml = (html: string): string => {
    if (!html) return '';

    let formatted = html;

    // Remove excessive nbsps if they are just clutter and not meaningful content
    // But be careful not to break meaningful spacing. 
    // The user complained about *multiple* nbsps. 
    // Let's replace 2+ nbsps with a single space? 
    // Or just standardise. Let's stick to formatting tags first.

    // Add newlines before opening block tags
    formatted = formatted.replace(/<(\/?)(div|p|ul|ol|li|h[1-6]|blockquote|table|tr|td)([^>]*)>/gi, (_, close, tag, attrs) => {
        // Logic: 
        // If it's an opening tag of a container (ul, ol, div, table), maybe indent?
        // For simplicity: put newline before every block tag (opening or closing) except maybe if start of string.
        // Also, usually we want content inside <p>...</p> to generally stay, but <p>...</p>\n is good.

        // Check if it's closing tag
        if (close) {
            return `</${tag}>\n`;
        } else {
            return `\n<${tag}${attrs}>`;
        }
    });

    // Clean dual newlines
    formatted = formatted.replace(/\n\s*\n/g, '\n');

    // Trim start/end
    return formatted.trim();
};
