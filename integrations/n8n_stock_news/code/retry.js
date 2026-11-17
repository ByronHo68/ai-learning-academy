function classify(raw, attempt, deadline, now = Date.now()) {
  const remaining = deadline - now;
  if (remaining <= 0) throw new Error('acquisition_deadline_exhausted');
  const status = Number(raw.statusCode || 0);
  const message = String(raw.error?.message || raw.error || '');
  const transient = [429,500,502,503,504].includes(status) || /\b(ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN)\b/.test(message);
  const failed = !!raw.error || raw.isError || status >= 400;
  if (!failed) return { retry:false, response:raw.body ?? raw };
  if (!transient || attempt >= 3) throw new Error('provider_unavailable_or_permanent_error');
  const header = raw.headers?.['retry-after'];
  const seconds = header == null ? 0 : (/^\d+$/.test(String(header)) ? Number(header) : Math.max(0,(Date.parse(header)-now)/1000));
  if (!Number.isFinite(seconds)) throw new Error('invalid_retry_after');
  const delay = Math.max(2 ** (attempt-1) + Math.random(), seconds);
  if (delay*1000 + 10000 >= remaining) throw new Error('retry_exceeds_deadline');
  return { retry:true, delay_seconds:delay };
}
