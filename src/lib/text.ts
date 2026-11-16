/** *palabra* → <em>palabra</em>, escapando HTML. Código de PLANTILLA. */
export const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const enfasis = (s: string) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
