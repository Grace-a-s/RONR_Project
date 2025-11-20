export async function fetchJson(url, options) {
  const res = await fetch(url, options);

  // Some status codes must not have a body (1xx, 204, 304). Return null for those.
  if (
    res.status === 204 ||
    res.status === 304 ||
    (res.status >= 100 && res.status < 200)
  ) {
    return null;
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      const data = await res.json();
      if (!res.ok)
        throw new Error(data && data.error ? data.error : `HTTP ${res.status}`);
      return data;
    } catch (e) {
      // JSON parsing failed
      throw new Error(`Failed to parse JSON response: ${e.message}`);
    }
  }

  // Fallback to text for other content types
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text;
}
