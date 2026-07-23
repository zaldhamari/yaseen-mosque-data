/**
 * Muslim Association of Canada (MAC) scraper — centres.macnet.ca
 *
 * 23 centres across AB, ON, QC, BC.
 * Each centre homepage at https://centres.macnet.ca/{slug}/ renders today's
 * athan + iqama times in static HTML (WordPress plugin, today's block is SSR).
 *
 * Slugs are enumerated from the macnet.ca/community-centres listing page.
 */

import * as cheerio from "cheerio";
import {
  CanadaMosque,
  PrayerRow,
  geocodeWithFallback,
  isShiaMosque,
  sleep,
  normalizeTime,
} from "./shared";

const LISTING_URL = "https://macnet.ca/community-centres";
const CENTRES_BASE = "https://centres.macnet.ca";
const SOURCE = "mac";

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "YaseenPrayerApp/2.0 (MAC mosque scraper; contact: zaki.alli2612@gmail.com)",
        Accept: "text/html",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ── Step 1: enumerate all centre slugs from the listing page ─────────────────
async function fetchCentreSlugs(): Promise<{ slug: string; name: string }[]> {
  console.log("  MAC: fetching centre list from macnet.ca…");
  const html = await fetchHtml(LISTING_URL);
  if (!html) {
    console.warn("  MAC: could not reach listing page — using known slugs");
    return KNOWN_SLUGS;
  }

  const $ = cheerio.load(html);
  const found: { slug: string; name: string }[] = [];

  // Links pointing to centres.macnet.ca
  $(`a[href*="centres.macnet.ca"]`).each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const match = href.match(/centres\.macnet\.ca\/([a-z0-9\-]+)\/?/i);
    if (!match) return;
    const slug = match[1].toLowerCase();
    const name =
      $(el).text().trim() ||
      $(el).closest("[class*='card'], article, li").find("h2, h3, h4").first().text().trim() ||
      slug;
    if (slug && !found.some((f) => f.slug === slug)) {
      found.push({ slug, name });
    }
  });

  if (found.length === 0) {
    console.warn("  MAC: no centre links found in listing page — using known slugs");
    return KNOWN_SLUGS;
  }

  console.log(`  MAC: found ${found.length} centre slugs`);
  return found;
}

// Fallback hardcoded list (confirmed from research)
const KNOWN_SLUGS: { slug: string; name: string }[] = [
  { slug: "alsalamcentre", name: "Al-Salam Centre (Calgary)" },
  { slug: "masjidtoronto", name: "Masjid Toronto" },
  { slug: "bic", name: "Barrhaven Islamic Centre" },
  { slug: "icwaterloo", name: "Islamic Centre of Waterloo" },
  { slug: "alrawdah", name: "Al Rawdah Islamic Centre (Montreal)" },
  { slug: "iccottawa", name: "Islamic Community Centre of Ottawa" },
  { slug: "iccnorth", name: "Islamic Community Centre North" },
  { slug: "iccscarborough", name: "Islamic Community Centre Scarborough" },
  { slug: "macmississauga", name: "MAC Mississauga" },
  { slug: "macvancouver", name: "MAC Vancouver" },
  { slug: "macedmonton", name: "MAC Edmonton" },
  { slug: "machamilton", name: "MAC Hamilton" },
  { slug: "macbrampton", name: "MAC Brampton" },
  { slug: "icclondon", name: "Islamic Community Centre London" },
  { slug: "macsaskatoon", name: "MAC Saskatoon" },
  { slug: "macwinnipeg", name: "MAC Winnipeg" },
];

// ── Step 2: parse a centre homepage ─────────────────────────────────────────
// MAC centres use the "daily-prayer-time-for-mosques" WP plugin.
// Each prayer lives in:  div.prayer-time.prayer-{name}
//   athan:  div.prayer-start  (text node with "3:58 am")
//   iqama:  div.prayer-jamaat (text node with "4:28 am")
// Times are rendered server-side in the static HTML — no JS required.
function parsePrayerTimesBlock(html: string): PrayerRow[] {
  const $ = cheerio.load(html);
  const rows: PrayerRow[] = [];

  const PRAYER_CSS_TO_NAME: Record<string, string> = {
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    duhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  };

  $("[class*='prayer-time prayer-']").each((_, el) => {
    const cls = $(el).attr("class") ?? "";
    const match = cls.match(/prayer-time\s+prayer-(\w+)/);
    if (!match) return;
    const key = match[1].toLowerCase();
    const prayerName = PRAYER_CSS_TO_NAME[key];
    if (!prayerName) return;

    const adhanRaw = $(el).find(".prayer-start").text().trim();
    const iqamaRaw = $(el).find(".prayer-jamaat").text().trim();

    const adhanTime = adhanRaw.match(/\d{1,2}:\d{2}\s*[apm]+/i)?.[0];
    const iqamaTime = iqamaRaw.match(/\d{1,2}:\d{2}\s*[apm]+/i)?.[0];

    if (!adhanTime && !iqamaTime) return;

    rows.push({
      salat: prayerName,
      adhan: adhanTime ? normalizeTime(adhanTime) : (iqamaTime ? normalizeTime(iqamaTime) : ""),
      iqamah: iqamaTime ? normalizeTime(iqamaTime) : null,
    });
  });

  return rows;
}

function parseAddress(html: string): string {
  const $ = cheerio.load(html);
  return (
    $("[class*='address'], [itemprop='streetAddress'], .location-address, footer address")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim() || ""
  );
}

function parseJummah(html: string): string | null {
  const $ = cheerio.load(html);
  const text = $("body").text();
  const match = text.match(/[Jj]um['']?[ua]h[^0-9]{0,30}(\d{1,2}:\d{2}\s*[APap][Mm])/);
  return match ? normalizeTime(match[1]) : null;
}

function parsePhone(html: string): string | null {
  const $ = cheerio.load(html);
  return $("a[href^='tel:']").first().attr("href")?.replace("tel:", "") ?? null;
}

function parseWebsite(slug: string): string {
  return `${CENTRES_BASE}/${slug}/`;
}

// Province heuristic from centre name / slug
function guessProvince(name: string, slug: string): string {
  const s = (name + " " + slug).toLowerCase();
  if (/calgary|edmonton|alberta|ab/.test(s)) return "Alberta";
  if (/montreal|rawdah|laval|quebec|qc/.test(s)) return "Quebec";
  if (/vancouver|bc|british/.test(s)) return "British Columbia";
  // Default: Ontario (majority of MAC centres)
  return "Ontario";
}

// ── Main export ─────────────────────────────────────────────────────────────
export async function scrapeMAC(): Promise<CanadaMosque[]> {
  console.log("🕌 Scraping MAC (centres.macnet.ca)…");
  const centres = await fetchCentreSlugs();
  const mosques: CanadaMosque[] = [];

  for (const centre of centres) {
    if (isShiaMosque(centre.name)) {
      console.log(`  [shia-skip] ${centre.name}`);
      continue;
    }

    const url = `${CENTRES_BASE}/${centre.slug}/`;
    console.log(`  ${centre.slug}`);
    const html = await fetchHtml(url);
    if (!html) {
      await sleep(500);
      continue;
    }

    const prayerTimes = parsePrayerTimesBlock(html);
    const address = parseAddress(html);
    const jummah = parseJummah(html);
    const phone = parsePhone(html);
    const province = guessProvince(centre.name, centre.slug);

    // Use address + province for display name of city; geocode to get coords
    let coordinates: { latitude: number; longitude: number } | null = null;
    let city = "";

    if (address) {
      const parts = address.split(",").map((p) => p.trim());
      if (parts.length >= 2) city = parts[parts.length - 2] ?? "";
      coordinates = await geocodeWithFallback(`${address}, Canada`);
      if (coordinates) await sleep(1100);
    }

    // No name-based geocode fallback: centre pages rarely publish a real street
    // address, and free-text searching a bare acronym like "MAC {slug}" has no
    // way to signal "mosque" to the geocoder. In practice this returned whatever
    // unrelated business loosely matched "MAC" (e.g. Apple/"Mac" retail listings)
    // instead of the actual centre — a wrong pin is worse than no pin, so leave
    // coordinates null when we don't have a real address to geocode.

    console.log(`  ✓ ${centre.name} — ${prayerTimes.length} prayer rows, coords: ${coordinates ? "yes" : "no"}`);

    mosques.push({
      id: `mac_${centre.slug}`,
      name: centre.name !== centre.slug ? centre.name : `MAC ${centre.slug}`,
      province,
      city,
      address,
      coordinates,
      organization: "Muslim Association of Canada",
      website: parseWebsite(centre.slug),
      phone,
      prayerTimes,
      jummah,
      source: SOURCE,
    });

    await sleep(500);
  }

  console.log(`✓ MAC: ${mosques.length} centres scraped`);
  return mosques;
}
