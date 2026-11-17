// Embedded in n8n Code nodes by build.py. No network or filesystem access.
function fail() { throw new Error('invalid_news_payload'); }
function text(v, nullable = false) {
  if (nullable && v === null) return null;
  if (typeof v !== 'string' || v.length > 100000) fail();
  return v.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
    .replace(/\b(?:\d[ -]?){13,19}\b/g, '[CARD_OR_LONG_NUMBER]');
}
function date(v) {
  if (v === null) return null;
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/.test(v) || !Number.isFinite(Date.parse(v))) fail();
  return new Date(v).toISOString();
}
function url(v) {
  if (v === null) return null;
  if (typeof v !== 'string' || v.length > 4096) fail();
  if (!/^https?:\/\/[^\s/@]+(?:\/|$)/i.test(v) || text(v) !== v) return null;
  const [base, query] = v.split('#')[0].split('?');
  const kept = (query || '').split('&').filter(x => x && !/^(utm_[^=]*|fbclid|gclid)=/i.test(x)).sort();
  return base + (kept.length ? '?' + kept.join('&') : '');
}
function unwrap(raw) {
  if (!raw || typeof raw !== 'object' || raw.isError || raw.error) fail();
  let value = raw.structuredContent ?? raw;
  if (!Array.isArray(value.news) && Array.isArray(raw.content)) {
    const blocks = raw.content.filter(x => x.type === 'text');
    if (blocks.length !== 1) fail();
    value = typeof blocks[0].text === 'string' ? JSON.parse(blocks[0].text) : blocks[0].text;
  }
  return value;
}
function company(raw, symbol) {
  const value = unwrap(raw);
  if (value.symbol !== symbol || !Array.isArray(value.news) || value.news.length > 100) fail();
  const rows = value.news.map(n => {
    if (!n || typeof n !== 'object' || typeof n.title !== 'string' || !n.title.trim() || typeof n.content !== 'string') fail();
    return { title: text(n.title), summary: text(n.summary, true), publisher: text(n.publisher, true),
      publishedAt: date(n.publishedAt), url: url(n.url), content: text(n.content) };
  });
  rows.sort((a,b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
  const seen = new Set();
  return rows.filter(n => { const key = n.url || JSON.stringify([n.title,n.publisher,n.publishedAt,n.content]);
    if (seen.has(key)) return false; seen.add(key); return true; }).slice(0,3);
}
function daily(raw, topic) {
  if (!raw || !Array.isArray(raw.feed) || raw.feed.length > 1000 || raw.Note || raw.Information || raw['Error Message']) fail();
  return raw.feed.map(n => {
    const t = n.time_published;
    if (typeof t !== 'string' || !/^\d{8}T\d{6}$/.test(t)) fail();
    const publishedAt = `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}T${t.slice(9,11)}:${t.slice(11,13)}:${t.slice(13,15)}Z`;
    if (typeof n.title !== 'string' || !n.title.trim() || typeof n.summary !== 'string') fail();
    return { title: text(n.title), summary: text(n.summary), content: text(n.summary), publisher: text(n.source ?? null,true),
      publishedAt: date(publishedAt), url: url(n.url ?? null), topic };
  });
}
