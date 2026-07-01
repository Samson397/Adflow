/** Turn "example.com/page" into "https://example.com/page" */
export function normalizeUrlInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function looksLikeUrl(input: string): boolean {
  const t = input.trim();
  if (!t || t.includes(" ")) return false;
  return (
    /^https?:\/\//i.test(t) ||
    /^[\w-]+(\.[\w-]+)+([\/?#].*)?$/i.test(t) ||
    /^localhost(:\d+)?([\/?#].*)?$/i.test(t)
  );
}
