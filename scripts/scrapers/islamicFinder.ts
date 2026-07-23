/**
 * islamicfinder.org scraper — Canada-wide mosque prayer times.
 *
 * URL hierarchy:
 *   /world/canada/                          → province links
 *   /world/canada/{province}/               → city links + mosque cards
 *   /world/canada/{province}/{city}/        → mosque cards (paginated)
 *   /masjid/{id}/{slug}/                    → mosque detail with prayer times
 *
 * The site is Next.js (server-rendered) so Cheerio works for listing pages.
 * Mosque detail pages may need Puppeteer for dynamic prayer time tables.
 */

import * as cheerio from "cheerio";
import puppeteer, { Browser, Page } from "puppeteer";
import {
  CanadaMosque,
  PrayerRow,
  geocodeWithFallback,
  isShiaMosque,
  sleep,
  normalizeTime,
} from "./shared";

const BASE = "https://www.islamicfinder.org";
const SOURCE = "islamicfinder";

// All Canadian provinces as they appear in islamicfinder URLs
const PROVINCES: { slug: string; name: string }[] = [
  { slug: "ontario", name: "Ontario" },
  { slug: "british-columbia", name: "British Columbia" },
  { slug: "alberta", name: "Alberta" },
  { slug: "quebec", name: "Quebec" },
  { slug: "manitoba", name: "Manitoba" },
  { slug: "saskatchewan", name: "Saskatchewan" },
  { slug: "nova-scotia", name: "Nova Scotia" },
  { slug: "new-brunswick", name: "New Brunswick" },
  { slug: "newfoundland-and-labrador", name: "Newfoundland and Labrador" },
  { slug: "prince-edward-island", name: "Prince Edward Island" },
  { slug: "northwest-territories", name: "Northwest Territories" },
  { slug: "nunavut", name: "Nunavut" },
  { slug: "yukon", name: "Yukon" },
];

interface RawMosqueRef {
  id: string;
  name: string;
  url: string;
  address: string;
  city: string;
  province: string;
  coordinates: { latitude: number; longitude: number } | null;
  website: string | null;
  phone: string | null;
}

// ── Listing page parser ─────────────────────────────────────────────────────

function parseMosqueCards(
  $: cheerio.CheerioAPI,
  province: string,
  city: string
): RawMosqueRef[] {
  const mosques: RawMosqueRef[] = [];

  // islamicfinder mosque cards — selector based on their typical class structure
  $(".masjid-list-item, .mosque-card, article[class*='masjid'], div[class*='mosque-item'], .place-card").each((_, el) => {
    const $el = $(el);

    // Name — usually in an anchor or heading inside the card
    const nameEl = $el.find("h2 a, h3 a, .masjid-name a, .mosque-name a, a[class*='name']").first();
    const name = nameEl.text().trim() || $el.find("h2, h3").first().text().trim();
    if (!name) return;

    // Link to detail page
    const href = nameEl.attr("href") || $el.find("a").first().attr("href") || "";
    const url = href.startsWith("http") ? href : `${BASE}${href}`;

    // Extract ID from URL like /masjid/123456/name-slug/
    const idMatch = url.match(/\/masjid\/(\d+)/);
    const id = idMatch ? `if_${idMatch[1]}` : `if_${name.toLowerCase().replace(/\s+/g, "_")}`;

    // Address
    const address = $el.find(".address, .masjid-address, p[class*='address'], span[class*='address']")
      .first().text().trim();

    // Coordinates from data attributes or map links
    let coordinates: { latitude: number; longitude: number } | null = null;
    const lat = $el.attr("data-lat") || $el.find("[data-lat]").attr("data-lat");
    const lng = $el.attr("data-lng") || $el.find("[data-lng]").attr("data-lng");
    if (lat && lng) {
      coordinates = { latitude: parseFloat(lat), longitude: parseFloat(lng) };
    }

    // Website / phone
    const website = $el.find("a[href^='http']:not([href*='islamicfinder'])").attr("href") ?? null;
    const phone = $el.find("a[href^='tel:']").attr("href")?.replace("tel:", "") ?? null;

    mosques.push({ id, name, url, address, city, province, coordinates, website, phone });
  });

  return mosques;
}

// ── Prayer times parser ─────────────────────────────────────────────────────

function parsePrayerTimesFromHtml(html: string): PrayerRow[] {
  const $ = cheerio.load(html);
  const rows: PrayerRow[] = [];
  const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Zuhr"];

  // Try table rows first
  $("table tr, .prayer-times tr, .salat-row, .prayer-row, [class*='prayer'] tr").each((_, row) => {
    const cells = $(row).find("td, th");
    if (cells.length < 2) return;

    const label = $(cells[0]).text().trim();
    const matched = PRAYER_NAMES.find((p) => label.toLowerCase().startsWith(p.toLowerCase()));
    if (!matched) return;

    const times = $(row).text().match(/\d{1,2}:\d{2}\s*[APap][Mm]/g) ?? [];
    if (!times.length) return;

    rows.push({
      salat: matched,
      adhan: normalizeTime(times[0]),
      iqamah: times[1] ? normalizeTime(times[1]) : null,
    });
  });

  if (rows.length > 0) return rows;

  // Fallback: look for prayer labels next to times anywhere on page
  const pageText = $("body").text();
  for (const prayer of PRAYER_NAMES) {
    const re = new RegExp(`${prayer}[^\\n]*?(\\d{1,2}:\\d{2}\\s*[APap][Mm])`, "i");
    const match = pageText.match(re);
    if (match) {
      rows.push({ salat: prayer, adhan: normalizeTime(match[1]), iqamah: null });
    }
  }

  return rows;
}

// ── Jummah parser ─────────────────────────────────────────────────────────

function parseJummah(html: string): string | null {
  const $ = cheerio.load(html);
  const text = $("body").text();
  const match = text.match(/[Jj]um['']?[au]h[^0-9]*(\d{1,2}:\d{2}\s*[APap][Mm])/);
  return match ? normalizeTime(match[1]) : null;
}

// ── Detail page scraper ─────────────────────────────────────────────────────

async function scrapeMosqueDetail(
  page: Page,
  ref: RawMosqueRef
): Promise<{ prayerTimes: PrayerRow[]; jummah: string | null; address: string }> {
  try {
    await page.goto(ref.url, { waitUntil: "domcontentloaded", timeout: 15000 });
    await sleep(600);
    const html = await page.content();
    const prayerTimes = parsePrayerTimesFromHtml(html);
    const jummah = parseJummah(html);

    // Try to get a better address from the detail page
    const $ = cheerio.load(html);
    const detailAddress = $(".address, .masjid-address, [itemprop='streetAddress'], [class*='address']")
      .first().text().trim();
    const address = detailAddress || ref.address;

    return { prayerTimes, jummah, address };
  } catch (e) {
    console.warn(`  ! Detail scrape failed for ${ref.name}: ${(e as Error).message}`);
    return { prayerTimes: [], jummah: null, address: ref.address };
  }
}

// ── Province scraper ────────────────────────────────────────────────────────

async function scrapeProvince(
  browser: Browser,
  province: { slug: string; name: string },
  geocodeAddresses: boolean
): Promise<CanadaMosque[]> {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) YaseenPrayerApp/2.0"
  );

  const allRefs: RawMosqueRef[] = [];
  let pageNum = 1;

  while (true) {
    const url = `${BASE}/world/canada/${province.slug}/?page=${pageNum}&type=masjid`;
    console.log(`  Fetching ${url}`);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      await sleep(500);
      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract city from URL or page context
      const refs = parseMosqueCards($, province.name, "");
      if (refs.length === 0) break;

      allRefs.push(...refs);

      // Check for next page
      const hasNext = $("a[rel='next'], .pagination .next, a:contains('Next')").length > 0;
      if (!hasNext) break;
      pageNum++;
      await sleep(800);
    } catch (e) {
      console.warn(`  ! Failed to load ${url}: ${(e as Error).message}`);
      break;
    }
  }

  console.log(`  Found ${allRefs.length} mosque refs in ${province.name}`);

  // Filter Shia mosques
  const sunniRefs = allRefs.filter((r) => {
    if (isShiaMosque(r.name)) {
      console.log(`  [shia-skip] ${r.name}`);
      return false;
    }
    return true;
  });

  // Scrape details + geocode
  const mosques: CanadaMosque[] = [];
  const detailPage = await browser.newPage();

  for (const ref of sunniRefs) {
    console.log(`  Scraping details: ${ref.name}`);
    const { prayerTimes, jummah, address } = await scrapeMosqueDetail(detailPage, ref);

    let coordinates = ref.coordinates;
    if (!coordinates && geocodeAddresses && address) {
      coordinates = await geocodeWithFallback(`${address}, Canada`);
      await sleep(1100);
    }

    mosques.push({
      id: ref.id,
      name: ref.name,
      province: ref.province,
      city: ref.city,
      address,
      coordinates,
      organization: null,
      website: ref.website,
      phone: ref.phone,
      prayerTimes,
      jummah,
      source: SOURCE,
    });

    await sleep(400);
  }

  await detailPage.close();
  await page.close();
  return mosques;
}

// ── Main export ─────────────────────────────────────────────────────────────

export async function scrapeIslamicFinder(
  browser: Browser,
  options: {
    provinces?: string[];   // province slugs to include, defaults to all
    geocode?: boolean;      // whether to geocode addresses (slow), default true
  } = {}
): Promise<CanadaMosque[]> {
  const targetProvinces = options.provinces
    ? PROVINCES.filter((p) => options.provinces!.includes(p.slug))
    : PROVINCES;
  const geocodeAddresses = options.geocode ?? true;

  const all: CanadaMosque[] = [];

  for (const province of targetProvinces) {
    console.log(`\n📍 Scraping province: ${province.name}`);
    const mosques = await scrapeProvince(browser, province, geocodeAddresses);
    console.log(`  ✓ ${mosques.length} mosques collected`);
    all.push(...mosques);
    await sleep(1000);
  }

  return all;
}
