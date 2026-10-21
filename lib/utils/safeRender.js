export function safeText(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.map(v => safeText(v)).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (value.label) return safeText(value.label);
    if (value.name) return safeText(value.name);
    if (value.title) return safeText(value.title);
    if (value.text) return safeText(value.text);
    if (value.explanation) return safeText(value.explanation);
    if (value.value != null) return safeText(value.value);
    if (value.content) return safeText(value.content);
    try { return JSON.stringify(value); } catch { return fallback; }
  }
  return String(value);
}

export function safeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => safeText(v)).filter(Boolean);
  return [safeText(value)].filter(Boolean);
}
