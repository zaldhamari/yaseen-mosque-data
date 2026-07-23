/**
 * Standalone data-collection script (run with `npm run scrape:mac`).
 *
 * Unlike awqat.net (one SPA, every masjid behind a single dropdown), the
 * Muslim Association of Canada runs its ~22 "Centres & Masajid" and ~13
 * "Local Chapters" as separate WordPress sites — most on the
 * `centres.macnet.ca/<slug>/` or `chapters.macnet.ca/<slug>/` multisite
 * network, a few on independently-branded domains that 301-redirect into
 * that same network (e.g. hespelermasjid.ca -> centres.macnet.ca/hespelermasjid/).
 * Nearly all of them share one WordPress plugin ("daily-prayer-time-for-mosques")
 * for rendering prayer times, so a single parser covers the large majority.
 *
 * This script:
 *   1. Starts from a hardcoded seed list (HARDCODED_CENTRES below) — a
 *      snapshot of every chapter this script's author could find on
 *      macnet.ca as of the date in SEED_CAPTURED_AT. This is the resilience
 *      layer the app owner asked for: if macnet.ca's own directory page
 *      changes structure or goes down, the scraper still has a known list
 *      of URLs to try.
 *   2. Also tries to discover additional/renamed chapters straight from
 *      macnet.ca's own directory pages, and unions anything new into the
 *      run (best-effort; failures here don't stop the seed list from
 *      being scraped).
 *   3. Visits every URL, follows redirects, and scrapes name/address/phone/
 *      prayer times/jummah with the shared-template parser.
 *   4. Geocodes new/changed addresses via Nominatim (serial requests, 1
 *      req/sec, matching scrapeAwqat.ts's convention and Nominatim's usage
 *      policy) — and on any failure, falls back to the *previous* cached
 *      coordinates for that slug rather than dropping them.
 *   5. Writes src/data/macMosques.json, shaped like vancouverMosques.json:
 *      { scrapedAt, mosques: [...] }. This is a bundled, offline "last
 *      known good" snapshot; canadaMosques.json is the merged dataset the
 *      app actually reads, and merging a fresh macMosques.json into it is
 *      a separate, deliberate step (not automatic) so a bad scrape can
 *      never silently corrupt the live dataset. See scripts/mergeMac.ts.
 *
 * Run periodically (e.g. a weekly cron/CI job — see CLAUDE.md) to catch
 * prayer-time changes, address corrections, or new/closed chapters.
 */

import fs from "node:fs/promises";
import path from "node:path";
import puppeteer, { Browser, Page } from "puppeteer";
import * as cheerio from "cheerio";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_USER_AGENT = "YaseenPrayerApp/1.0 (data collection script; contact: infoawqat@gmail.com)";
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "macMosques.json");
const SEED_CAPTURED_AT = "2026-07-06";

// -----------------------------------------------------------------------
// 1. Hardcoded seed list — the resilience layer. Every slug here is a real
//    MAC chapter confirmed live as of SEED_CAPTURED_AT. If macnet.ca's own
//    directory changes or breaks, this list keeps the scraper useful.
// -----------------------------------------------------------------------
interface SeedCentre {
  slug: string;
  url: string;
  fallbackName: string;
  fallbackProvince: string;
  fallbackCity: string;
}

const HARDCODED_CENTRES: SeedCentre[] = [
  { slug: "coldlake", url: "https://centres.macnet.ca/coldlake/", fallbackName: "Islamic Centre of Cold Lake", fallbackProvince: "Alberta", fallbackCity: "Cold Lake" },
  { slug: "alsalamcentre", url: "https://centres.macnet.ca/alsalamcentre/", fallbackName: "Al-Salam Centre", fallbackProvince: "Alberta", fallbackCity: "Calgary" },
  { slug: "rahmamosque", url: "https://centres.macnet.ca/rahmamosque/", fallbackName: "MAC Islamic Centre (Rahma Mosque)", fallbackProvince: "Alberta", fallbackCity: "Edmonton" },
  { slug: "icwaterloo", url: "https://centres.macnet.ca/icwaterloo/", fallbackName: "Islamic Centre of Waterloo", fallbackProvince: "Ontario", fallbackCity: "Waterloo" },
  { slug: "hespelermasjid", url: "https://centres.macnet.ca/hespelermasjid/", fallbackName: "Hespeler Masjid", fallbackProvince: "Ontario", fallbackCity: "Cambridge" },
  { slug: "kitchenermasjid", url: "https://centres.macnet.ca/kitchenermasjid/", fallbackName: "Kitchener Masjid", fallbackProvince: "Ontario", fallbackCity: "Kitchener" },
  { slug: "masjidaisha", url: "https://centres.macnet.ca/masjidaisha/", fallbackName: "Masjid Aisha", fallbackProvince: "Ontario", fallbackCity: "Guelph" },
  { slug: "westmount", url: "https://centres.macnet.ca/westmount/", fallbackName: "MAC Westmount Islamic Centre", fallbackProvince: "Ontario", fallbackCity: "London" },
  { slug: "machydepark", url: "https://centres.macnet.ca/machydepark/", fallbackName: "MAC Hyde Park Centre", fallbackProvince: "Ontario", fallbackCity: "London" },
  { slug: "icco", url: "https://centres.macnet.ca/icco/", fallbackName: "Islamic Community Centre of Ontario (ICCO)", fallbackProvince: "Ontario", fallbackCity: "Mississauga" },
  { slug: "theciic", url: "https://centres.macnet.ca/theciic/", fallbackName: "Canadian Institute of Islamic Civilization (CIIC)", fallbackProvince: "Quebec", fallbackCity: "Montreal" },
  { slug: "mac-quebec", url: "https://centres.macnet.ca/mac-quebec/", fallbackName: "Centre Communautaire MAC (Ville de Québec)", fallbackProvince: "Quebec", fallbackCity: "Quebec City" },
  { slug: "cclmac", url: "https://centres.macnet.ca/cclmac/", fallbackName: "Centre Communautaire Laurentien (CCL)", fallbackProvince: "Quebec", fallbackCity: "Montreal" },
  { slug: "ccv", url: "https://centres.macnet.ca/ccv/", fallbackName: "Centre Communautaire Villeray (CCV) / Mosquée Aboubakr", fallbackProvince: "Quebec", fallbackCity: "Montreal" },
  { slug: "civ", url: "https://centres.macnet.ca/civ/", fallbackName: "Centre Islamique de Verdun (CIV)", fallbackProvince: "Quebec", fallbackCity: "Montreal" },
  { slug: "alrawdah", url: "https://centres.macnet.ca/alrawdah/", fallbackName: "Mosquée AlRawdah (MAC)", fallbackProvince: "Quebec", fallbackCity: "Montreal" },
  { slug: "bic", url: "https://centres.macnet.ca/bic/", fallbackName: "Barrhaven Islamic Centre", fallbackProvince: "Ontario", fallbackCity: "Nepean" },
  { slug: "qic", url: "https://centres.macnet.ca/qic/", fallbackName: "Qurtuba Islamic Centre", fallbackProvince: "Ontario", fallbackCity: "Ottawa" },
  { slug: "mycentre", url: "https://centres.macnet.ca/mycentre/", fallbackName: "Islamic Centre Ottawa", fallbackProvince: "Ontario", fallbackCity: "Ottawa" },
  { slug: "masjidtoronto", url: "https://centres.macnet.ca/masjidtoronto/", fallbackName: "Masjid Toronto (Dundas & Adelaide)", fallbackProvince: "Ontario", fallbackCity: "Toronto" },
  { slug: "macvancouvercentre", url: "https://centres.macnet.ca/macvancouvercentre/", fallbackName: "MAC Vancouver Centre", fallbackProvince: "British Columbia", fallbackCity: "Vancouver" },
  { slug: "rcic", url: "https://centres.macnet.ca/rcic/", fallbackName: "Rose City Islamic Centre", fallbackProvince: "Ontario", fallbackCity: "Windsor" },
];

// Directory pages to (best-effort) crawl for new/renamed chapters. If these
// fail or change shape, the hardcoded seed list above still runs.
const DISCOVERY_URLS = [
  "https://macnet.ca/community-centres/",
  "https://macnet.ca/local-chapters/",
];

interface ScrapedPrayerRow {
  salat: string;
  adhan: string;
  iqamah: string;
}

interface ScrapedCentre {
  slug: string;
  url: string;
  name: string;
  province: string;
  city: string;
  address: string | null;
  phone: string | null;
  prayerTimes: ScrapedPrayerRow[];
  jummah: string | null;
}

interface OutputMosque {
  slug: string;
  name: string;
  province: string;
  city: string;
  address: string | null;
  coordinates: { latitude: number; longitude: number } | null;
  organization: string;
  website: string;
  phone: string | null;
  prayerTimes: ScrapedPrayerRow[];
  jummah: string | null;
}

const CANADIAN_PROVINCE_ABBR = "AB|BC|ON|QC|MB|SK|NS|NB|PE|NL|NT|NU|YT";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Best-effort discovery of additional chapter URLs from macnet.ca's own directory pages. */
async function discoverAdditionalUrls(page: Page): Promise<{ slug: string; url: string }[]> {
  const found: { slug: string; url: string }[] = [];
  for (const directoryUrl of DISCOVERY_URLS) {
    try {
      await page.goto(directoryUrl, { waitUntil: "networkidle2", timeout: 15000 });
      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]")).map((a) => (a as HTMLAnchorElement).href)
      );
      for (const href of links) {
        const match = href.match(/(centres|chapters)\.macnet\.ca\/([a-z0-9-]+)\/?$/i);
        if (match) found.push({ slug: match[2].toLowerCase(), url: href });
      }
    } catch (error) {
      console.warn(`  ! discovery failed for ${directoryUrl} (non-fatal, continuing with seed list):`, error);
    }
  }
  return found;
}

/** Follows redirects (e.g. independently-branded domains -> centres.macnet.ca) and scrapes one chapter page. */
async function scrapeCentrePage(
  page: Page,
  slug: string,
  url: string,
  fallback: { name: string; province: string; city: string }
): Promise<ScrapedCentre | null> {
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
  } catch (error) {
    console.warn(`  ! ${slug}: failed to load ${url}, skipping this run (cache will retain last-known data):`, error);
    return null;
  }

  await sleep(500); // let any JS-rendered prayer-time widget finish

  const html = await page.content();
  const $ = cheerio.load(html);
  const bodyText = $("body").text();

  if (/page not found|whoops, that page is gone|404/i.test(bodyText.slice(0, 2000))) {
    console.warn(`  ! ${slug}: page reports not-found, skipping this run`);
    return null;
  }

  const pageTitle = $("title").first().text().split(/[-|–]/)[0].trim();
  const name = pageTitle || fallback.name;

  // Address: a near-leaf element (<= 1 child, e.g. a trailing <br> before the phone
  // number) whose text is short and contains a Canadian postal-code-shaped fragment.
  const addressEl = $("body")
    .find("*")
    .filter((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      return (
        $el.children().length <= 1 &&
        text.length > 0 &&
        text.length < 150 &&
        new RegExp(`,\\s*(${CANADIAN_PROVINCE_ABBR})\\s*[A-Za-z]\\d[A-Za-z]`).test(text)
      );
    })
    .first();
  const addressText = addressEl.text().trim() || null;
  // Phone numbers are often glued into the same block as the address separated by a <br>.
  const phoneMatch = addressText?.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;
  // Strip a trailing phone number back out of the address string itself, if present.
  const address = addressText ? addressText.replace(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}.*$/, "").trim() || null : null;

  const salatNames = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
  const prayerTimes: ScrapedPrayerRow[] = [];
  for (const key of salatNames) {
    const row = $(`.prayer-time.prayer-${key}`).first();
    if (!row.length) continue;
    const adhan = row.find(".prayer-start").first().text().trim();
    const iqamah = row.find(".prayer-jamaat").first().text().trim();
    if (!adhan) continue;
    prayerTimes.push({
      salat: key === "sunrise" ? "Sunrise" : key.charAt(0).toUpperCase() + key.slice(1),
      adhan,
      iqamah: iqamah || adhan,
    });
  }

  let jummah: string | null = null;
  const jummahEl = $('.prayer-jumuah, [class*="jumuah"], [class*="jummah"]').first();
  if (jummahEl.length) {
    const times = jummahEl.text().match(/\d{1,2}:\d{2}\s*[AP]M/i);
    jummah = times ? times[0] : jummahEl.text().trim() || null;
  }

  return {
    slug,
    url: page.url(), // the post-redirect canonical URL
    name,
    province: fallback.province,
    city: fallback.city,
    address,
    phone,
    prayerTimes,
    jummah,
  };
}

async function geocodeOnce(query: string): Promise<{ latitude: number; longitude: number } | null> {
  const params = new URLSearchParams({ q: query, format: "json", limit: "1" });
  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: { "User-Agent": NOMINATIM_USER_AGENT },
  });
  if (!response.ok) return null;
  const results = (await response.json()) as { lat: string; lon: string }[];
  if (!results.length) return null;
  return { latitude: parseFloat(results[0].lat), longitude: parseFloat(results[0].lon) };
}

function withoutUnitNumber(address: string): string {
  return address
    .replace(/^[a-zA-Z0-9]+-(\d)/, "$1")
    .replace(/#\s*[a-zA-Z0-9]+\s*/g, "")
    .replace(/\bunit\s+[a-zA-Z0-9]+\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function geocodeAddress(address: string | null): Promise<{ latitude: number; longitude: number } | null> {
  if (!address) return null;
  try {
    const direct = await geocodeOnce(address);
    if (direct) return direct;
    const simplified = withoutUnitNumber(address);
    if (simplified !== address) {
      await sleep(1100);
      return await geocodeOnce(simplified);
    }
    return null;
  } catch (error) {
    console.warn(`  ! geocoding failed for "${address}":`, error);
    return null;
  }
}

async function loadPreviousSnapshot(): Promise<Map<string, OutputMosque>> {
  const bySlug = new Map<string, OutputMosque>();
  try {
    const raw = await fs.readFile(OUTPUT_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { mosques: OutputMosque[] };
    for (const m of parsed.mosques) bySlug.set(m.slug, m);
  } catch {
    // No previous snapshot yet — that's fine, this is the first run.
  }
  return bySlug;
}

async function main(): Promise<void> {
  const previous = await loadPreviousSnapshot();

  console.log("Launching headless browser...");
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) YaseenPrayerApp/1.0"
  );

  console.log("Discovering chapters from macnet.ca directory pages (best-effort)...");
  const discovered = await discoverAdditionalUrls(page);
  const seedSlugs = new Set(HARDCODED_CENTRES.map((c) => c.slug));
  const extra = discovered.filter((d) => !seedSlugs.has(d.slug));
  if (extra.length) {
    console.log(`Discovered ${extra.length} chapter(s) not in the hardcoded seed list:`, extra.map((e) => e.slug));
  }

  const targets: SeedCentre[] = [
    ...HARDCODED_CENTRES,
    ...extra.map((e) => ({
      slug: e.slug,
      url: e.url,
      fallbackName: `MAC ${e.slug}`,
      fallbackProvince: "Ontario", // unknown until scraped; overwritten by page title/content where possible
      fallbackCity: "",
    })),
  ];

  const scraped: ScrapedCentre[] = [];
  for (const target of targets) {
    console.log(`Scraping "${target.slug}" (${target.url})...`);
    const result = await scrapeCentrePage(page, target.slug, target.url, {
      name: target.fallbackName,
      province: target.fallbackProvince,
      city: target.fallbackCity,
    });
    if (result) scraped.push(result);
    await sleep(400); // polite, low-frequency visitor
  }

  await browser.close();
  console.log(`Scraped ${scraped.length}/${targets.length} chapter pages. Geocoding addresses via Nominatim...`);

  const output: OutputMosque[] = [];
  for (const centre of scraped) {
    const prev = previous.get(centre.slug);
    let coordinates: { latitude: number; longitude: number } | null = null;

    if (centre.address) {
      coordinates = await geocodeAddress(centre.address);
      await sleep(1100); // respect Nominatim's 1 request/second usage policy
    }
    // Fall back to the last-known-good coordinates if this run couldn't geocode
    // (e.g. Nominatim hiccup, address text changed slightly) — never regress to null
    // if we previously had a good value.
    if (!coordinates && prev?.coordinates) {
      coordinates = prev.coordinates;
    }

    output.push({
      slug: centre.slug,
      name: centre.name,
      province: centre.province,
      city: centre.city || prev?.city || "",
      address: centre.address ?? prev?.address ?? null,
      coordinates,
      organization: "Muslim Association of Canada (MAC)",
      website: centre.url,
      phone: centre.phone ?? prev?.phone ?? null,
      prayerTimes: centre.prayerTimes.length ? centre.prayerTimes : prev?.prayerTimes ?? [],
      jummah: centre.jummah ?? prev?.jummah ?? null,
    });
  }

  // Any slug that failed entirely this run (page down, discovery-only miss, etc.)
  // still gets carried forward from the previous snapshot so a bad run never
  // silently deletes a real, previously-confirmed chapter.
  const scrapedSlugs = new Set(output.map((m) => m.slug));
  for (const [slug, prevEntry] of previous) {
    if (!scrapedSlugs.has(slug)) {
      console.warn(`  ! ${slug}: not reachable this run, carrying forward cached data`);
      output.push(prevEntry);
    }
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify({ scrapedAt: new Date().toISOString(), mosques: output }, null, 2));
  console.log(`Wrote ${output.length} MAC chapters to ${OUTPUT_PATH}`);
  console.log("Note: this only refreshes the MAC-specific cache. Run `npm run merge:mac` afterwards to");
  console.log("reconcile it into src/data/canadaMosques.json (dedup + fix broken entries) before shipping.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
