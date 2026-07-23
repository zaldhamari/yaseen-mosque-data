/**
 * Shared types, utilities, and Shia-mosque filter used by all scrapers.
 */

export interface PrayerRow {
  salat: string;
  adhan: string;
  iqamah: string | null;
}

export interface CanadaMosque {
  id: string;
  name: string;
  province: string;
  city: string;
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
  organization: string | null;
  website: string | null;
  phone: string | null;
  prayerTimes: PrayerRow[];
  jummah: string | null;
  source: string;
}

// ── Shia mosque filter ───────────────────────────────────────────────────────
// Keywords that strongly indicate a Shia or non-Sunni mosque.
const SHIA_KEYWORDS: RegExp[] = [
  /\bshi['']?a\b/i,
  /\bshiite\b/i,
  /\bshiah\b/i,
  /\bhussain(i(ya|yya|yyah)?|iyah)?\b/i,
  /\bhussein(i(ya|yya|yyah)?)?\b/i,
  /\bimami\b/i,
  /\bithna[\s-]?ashari\b/i,
  /\bja['']?f{1,2}ari\b/i,
  /\bkhoja\b/i,
  /\bismaili?\b/i,
  /\bbohra\b/i,
  /\bdawoodi\b/i,
  /\bmehfil\b/i,
  /\bfatimi(ya)?\b/i,
  /\bzainab(i(ya)?)?\b/i,
];

export function isShiaMosque(name: string): boolean {
  return SHIA_KEYWORDS.some((re) => re.test(name));
}

// ── Nominatim geocoding ─────────────────────────────────────────────────────
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const UA = "YaseenPrayerApp/2.0 (canada-scraper; contact: zaki.alli2612@gmail.com)";

export async function geocode(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  if (!address) return null;
  try {
    const params = new URLSearchParams({ q: address, format: "json", limit: "1" });
    const res = await fetch(`${NOMINATIM}?${params}`, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

/** Strip suite/unit prefixes that confuse Nominatim: "204-7060 Main St" → "7060 Main St" */
export function simplifyAddress(address: string): string {
  return address
    .replace(/^[a-zA-Z0-9]+-(\d)/, "$1")
    .replace(/#\s*[a-zA-Z0-9]+\s*/g, "")
    .replace(/\bunit\s+[a-zA-Z0-9]+\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function geocodeWithFallback(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  const direct = await geocode(address);
  if (direct) return direct;
  const simplified = simplifyAddress(address);
  if (simplified !== address) {
    await sleep(1100);
    return geocode(simplified);
  }
  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function extractCity(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  // "123 Main St, Toronto, Ontario, Canada" → "Toronto"
  if (parts.length >= 3) return parts[parts.length - 3] ?? parts[0];
  if (parts.length === 2) return parts[0];
  return address;
}

export function normalizeTime(raw: string): string {
  // "1:30PM" → "1:30 PM", "13:30" → "1:30 PM"
  const s = raw.trim().replace(/([APap][Mm])/, " $1").replace(/\s+/g, " ");
  return s;
}
