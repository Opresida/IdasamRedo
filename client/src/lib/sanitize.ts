import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML para uso seguro com dangerouslySetInnerHTML.
 * Remove scripts, event handlers e outros vetores XSS.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'hr', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'pre', 'code', 'sup', 'sub',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
      'width', 'height', 'colspan', 'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Cria objeto seguro para dangerouslySetInnerHTML.
 */
export function createSafeHtml(dirty: string): { __html: string } {
  return { __html: sanitizeHtml(dirty) };
}
