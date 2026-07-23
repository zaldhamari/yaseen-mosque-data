/**
 * ICNA Canada scraper.
 *
 * Locations and their URLs (hardcoded — the our-locations page doesn't have
 * consistent slug links for all centres).
 *
 * All sites use the "daily-prayer-time-for-mosques" WP plugin but with a
 * table-style layout:  div.prayer-row  with three columns:
 *   prayer name | adhan time | iqamah time
 *
 * Requires a browser-like User-Agent — the server returns 406 to plain UAs.
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

const SOURCE = "icna";
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface IcnaLocation {
  id: string;
  name: string;
  address: string;
  province: string;
  city: string;
  url: string;
  organization: string;
}

// All confirmed ICNA Canada locations with their actual prayer-times URL
const ICNA_LOCATIONS: IcnaLocation[] = [
  {
    id: "icna_966",
    name: "966 Community Centre",
    address: "966 Dundas St E, Unit 14, Mississauga, ON L4Y 4H5",
    province: "Ontario",
    city: "Mississauga",
    url: "https://icna.ca/966/",
    organization: "ICNA Canada",
  },
  {
    id: "icna_aric",
    name: "Ar-Rehman Islamic Centre (ARIC)",
    address: "1-6120 Montevideo Road, Mississauga, ON L5N 3W5",
    province: "Ontario",
    city: "Mississauga",
    url: "http://www.aric-icna.ca/",
    organization: "ICNA Canada",
  },
  {
    id: "icna_kitchener",
    name: "Al-Falah Islamic Centre Kitchener",
    address: "565 Trillium Drive, Unit 6, Kitchener, ON N2R 1J4",
    province: "Ontario",
    city: "Kitchener",
    url: "http://www.alfalahkitchener.org",
    organization: "ICNA Canada",
  },
  {
    id: "icna_milton",
    name: "Islamic Community Centre of Milton (ICCM)",
    address: "8069 Esquesing Line, Milton, ON L9T 7L4",
    province: "Ontario",
    city: "Milton",
    url: "http://www.icnamilton.com",
    organization: "ICNA Canada",
  },
  {
    id: "icna_oakville",
    name: "Al-Falah Islamic Centre Oakville",
    address: "391 Burnhamthorpe Road East, Oakville, ON L6H 7B4",
    province: "Ontario",
    city: "Oakville",
    url: "https://icna.ca/",
    organization: "ICNA Canada",
  },
  {
    id: "icna_scarborough",
    name: "Al Fauz Islamic Centre",
    address: "156 Shorting Rd, Scarborough, ON M1S 3S3",
    province: "Ontario",
    city: "Scarborough",
    url: "https://icna.ca/",
    organization: "ICNA Canada",
  },
  {
    id: "icna_edmonton",
    name: "Al-Falah Islamic Centre Edmonton",
    address: "2401 47 St NW, Edmonton, AB T6L 4P6",
    province: "Alberta",
    city: "Edmonton",
    url: "https://icna.ca/",
    organization: "ICNA Canada",
  },
  {
    id: "icna_newfoundland",
    name: "Al-Falah Islamic Centre St. John's",
    address: "47 Smith Ave, St. John's, NL A1C 5G1",
    province: "Newfoundland and Labrador",
    city: "St. John's",
    url: "https://icnanewfoundland.ca/",
    organization: "ICNA Canada",
  },
];

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: "text/html" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Parse the prayer-row table layout used by ICNA sites
// Each row: <div class="prayer-row"> ... name ... adhan ... iqamah ...
function parsePrayerRows(html: string): PrayerRow[] {
  const $ = cheerio.load(html);
  const rows: PrayerRow[] = [];

  const PRAYER_MAP: Record<string, string> = {
    fajr: "Fajr", subh: "Fajr",
    zuhr: "Dhuhr", dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  };

  $(".prayer-row, [class*='prayer-row']").each((_, el) => {
    // Extract all text content, split by whitespace
    const rawText = $(el).text().replace(/\s+/g, " ").trim();
    // Pattern: "PrayerName  HH:MM am  HH:MM am"
    const times = rawText.match(/\d{1,2}:\d{2}\s*[aApP][mM]/g) ?? [];
    if (!times.length) return;

    // Prayer name is the first non-time word group
    const nameMatch = rawText.match(/^([A-Za-zÀ-ɏ]+)/);
    if (!nameMatch) return;

    const key = nameMatch[1].toLowerCase();
    const prayerName = PRAYER_MAP[key];
    if (!prayerName) return;

    rows.push({
      salat: prayerName,
      adhan: normalizeTime(times[0]),
      iqamah: times[1] ? normalizeTime(times[1]) : null,
    });
  });

  // Fallback: try the MAC-style prayer-start/prayer-jamaat divs
  if (rows.length === 0) {
    const PRAYER_CSS: Record<string, string> = {
      fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", duhr: "Dhuhr",
      asr: "Asr", maghrib: "Maghrib", isha: "Isha",
    };
    $("[class*='prayer-time prayer-']").each((_, el) => {
      const cls = $(el).attr("class") ?? "";
      const m = cls.match(/prayer-time\s+prayer-(\w+)/);
      if (!m) return;
      const name = PRAYER_CSS[m[1].toLowerCase()];
      if (!name) return;
      const adhan = $(el).find(".prayer-start").text().match(/\d{1,2}:\d{2}\s*[apm]+/i)?.[0];
      const iqama = $(el).find(".prayer-jamaat").text().match(/\d{1,2}:\d{2}\s*[apm]+/i)?.[0];
      if (!adhan && !iqama) return;
      rows.push({
        salat: name,
        adhan: adhan ? normalizeTime(adhan) : (iqama ? normalizeTime(iqama) : ""),
        iqamah: iqama ? normalizeTime(iqama) : null,
      });
    });
  }

  return rows;
}

function parseJummah(html: string): string | null {
  const $ = cheerio.load(html);
  // Try jumuah-row first
  let jummah: string | null = null;
  $(".jumuah-row, [class*='jumuah'], [class*='jummah']").each((_, el) => {
    const times = $(el).text().match(/\d{1,2}:\d{2}\s*[aApP][mM]/g) ?? [];
    if (times.length && !jummah) jummah = normalizeTime(times[0]);
  });
  if (jummah) return jummah;

  const text = $("body").text();
  const m = text.match(/[Jj]um['']?[ua]h[^0-9]{0,30}(\d{1,2}:\d{2}\s*[aApP][mM])/);
  return m ? normalizeTime(m[1]) : null;
}

export async function scrapeICNA(): Promise<CanadaMosque[]> {
  console.log("🕌 Scraping ICNA Canada…");
  const mosques: CanadaMosque[] = [];

  for (const loc of ICNA_LOCATIONS) {
    if (isShiaMosque(loc.name)) continue;

    console.log(`  ${loc.id} (${loc.url})`);
    const html = await fetchHtml(loc.url);
    await sleep(600);

    let prayerTimes: PrayerRow[] = [];
    let jummah: string | null = null;

    if (html) {
      prayerTimes = parsePrayerRows(html);
      jummah = parseJummah(html);
    } else {
      console.log(`  ! Could not fetch ${loc.url}`);
    }

    // Geocode the address
    let coordinates: { latitude: number; longitude: number } | null = null;
    if (loc.address) {
      coordinates = await geocodeWithFallback(`${loc.address}, Canada`);
      if (coordinates) await sleep(1100);
    }

    console.log(`  ✓ ${loc.name} — ${prayerTimes.length} prayer rows, coords: ${coordinates ? "yes" : "no"}`);

    mosques.push({
      id: loc.id,
      name: loc.name,
      province: loc.province,
      city: loc.city,
      address: loc.address,
      coordinates,
      organization: loc.organization,
      website: loc.url,
      phone: null,
      prayerTimes,
      jummah,
      source: SOURCE,
    });
  }

  console.log(`✓ ICNA: ${mosques.length} locations scraped`);
  return mosques;
}
