import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content using DOMPurify.
 * Allowed tags and attributes are configured to support rich text editing
 * while stripping malicious scripts and iframes.
 */
export const sanitizeHtml = (content: string): string => {
    return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img'
        ],
        ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'title', 'class']
    });
};

/**
 * Sanitizes plain text input by trimming whitespace and completely stripping HTML tags.
 * Useful for fields like Name, SKU, etc.
 */
export const sanitizeText = (content: string): string => {
    if (typeof content !== 'string') return content;
    const trimmed = content.trim();
    // Strip all HTML tags
    return trimmed.replace(/<\/?[^>]+(>|$)/g, "");
};
