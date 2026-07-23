/**
 * Standalone data-collection script (run with `npm run scrape:mosques`).
 *
 * awqat.net is a client-rendered React SPA with no static HTML and no public
 * scraping API, so Cheerio alone can't read it. This script drives a real
 * headless browser (Puppeteer) to execute the site's own JavaScript exactly
 * like a visitor would, then parses the *rendered* HTML with Cheerio.
 *
 * The site's masjid dropdown maps each mosque to an opaque database id, and
 * the resulting URL slug is not a deterministic function of the mosque name
 * (confirmed by testing — e.g. "Brentwood BNH ** JUMA ONLY **" does not
 * resolve from a naive slugified guess). So instead of guessing slugs, this
 * script drives the real <select> element for every option and reads back
 * whatever URL the app itself navigates to.
 *
 * Output: src/data/vancouverMosques.json — a bundled, offline snapshot used
 * by prayerTimeService/mosqueFinderService. Prayer/iqamah times in the
 * snapshot are "last known" values for the day the scrape ran; the app
 * treats astronomical calculation (astronomicalCalculator.ts) as the source
 * of truth for any date beyond that, and this script should be re-run
 * periodically to refresh the snapshot.
 */

import fs from "node:fs/promises";
import path from "node:path";
import puppeteer, { Browser, Page } from "puppeteer";
import * as cheerio from "cheerio";

const SITE_URL = "https://www.awqat.net/";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
// Nominatim's usage policy requires a descriptive User-Agent and a max of 1 request/second.
const NOMINATIM_USER_AGENT = "YaseenPrayerApp/1.0 (data collection script; contact: infoawqat@gmail.com)";
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "vancouverMosques.json");

interface ScrapedPrayerRow {
  salat: string;
  adhan: string;
  iqamah: string;
}

interface ScrapedMasjid {
  id: string;
  name: string;
  slug: string;
  address: string;
  organization: string | null;
  website: string | null;
  prayerTimes: ScrapedPrayerRow[];
  jummah: string | null;
}

interface OutputMosque {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: { latitude: number; longitude: number } | null;
  organization: string | null;
  website: string | null;
  prayerTimes: ScrapedPrayerRow[];
  jummah: string | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readMasjidOptions(page: Page): Promise<{ id: string; name: string }[]> {
  return page.evaluate(() => {
    const select = document.querySelector("select");
    if (!select) return [];
    return Array.from(select.options)
      .filter((o) => o.value)
      .map((o) => ({ id: o.value, name: o.textContent?.trim() ?? "" }));
  });
}

/** Selects `optionValue` on the page's native <select>; Puppeteer's page.select() sets the value and fires the input/change events React listens for. */
async function selectMasjid(page: Page, optionValue: string): Promise<void> {
  await page.select("select", optionValue);
}

async function scrapeMasjidPage(page: Page, id: string, name: string): Promise<ScrapedMasjid | null> {
  await page.goto(SITE_URL, { waitUntil: "networkidle2" });
  await selectMasjid(page, id);

  try {
    await page.waitForFunction(() => location.pathname.startsWith("/masjid/"), { timeout: 8000 });
  } catch {
    console.warn(`  ! ${name}: dropdown selection never navigated, skipping`);
    return null;
  }

  // Give the page a moment to finish fetching and rendering the prayer times table.
  await sleep(800);

  const slug = new URL(page.url()).pathname.replace("/masjid/", "");
  const html = await page.content();
  const $ = cheerio.load(html);

  if (/Unable to load prayer times/i.test($("body").text())) {
    console.warn(`  ! ${name}: page reported an error, skipping`);
    return null;
  }

  // The address is a leaf (childless) element; requiring no children excludes ancestor
  // wrappers whose concatenated text (name + address + org) would otherwise also match.
  const addressEl = $("main")
    .find("*")
    .filter((_, el) => $(el).children().length === 0 && /,\s*(British Columbia|BC)\b/.test($(el).text().trim()))
    .first();
  const address = addressEl.text().trim();
  // The element right after the address is either the organization name, or (for
  // independent masjids with no parent organization) a repeat of the masjid name.
  const orgCandidate = addressEl.next().text().trim();
  const organizationFromDom = orgCandidate && orgCandidate !== name ? orgCandidate : null;

  const website = $('a[href^="http"]:contains("Website")').attr("href") ?? null;

  const rows: ScrapedPrayerRow[] = [];
  let jummah: string | null = null;

  // Some rows carry a hidden accessibility span (e.g. a stray "Jummah 1:" text node nested
  // inside the visible "1:30 PM" cell) that breaks leaf-node-based cell extraction. Matching
  // clean "H:MM AM/PM" time patterns against the row's full text sidesteps that DOM quirk.
  const salatNames = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Jummah"];
  $("table tr").each((_, row) => {
    const rowText = $(row).text().trim();
    const label = salatNames.find((n) => rowText.startsWith(n));
    if (!label) return; // header row or anything unrecognized

    const times = rowText.match(/\d{1,2}:\d{2}\s*[AP]M/g) ?? [];
    if (label === "Jummah") {
      jummah = times[0] ?? null;
      return;
    }
    if (times.length === 0) return; // masjid publishes no time for this salat
    rows.push({ salat: label, adhan: times[0], iqamah: times[1] ?? times[0] });
  });

  return {
    id,
    name,
    slug,
    address,
    organization: organizationFromDom,
    website,
    prayerTimes: rows,
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

/** Strips unit/suite prefixes and suffixes (e.g. "204-7060 Waltham Ave" -> "7060 Waltham Ave", "24 Ave #61" -> "24 Ave") that Nominatim otherwise fails to match. */
function withoutUnitNumber(address: string): string {
  return address
    .replace(/^[a-zA-Z0-9]+-(\d)/, "$1") // leading "204-7060" -> "7060"
    .replace(/#\s*[a-zA-Z0-9]+\s*/g, "") // "#61" anywhere
    .replace(/\bunit\s+[a-zA-Z0-9]+\b/gi, "") // "Unit 123"
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
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

function extractCity(address: string): string {
  const parts = address.split(",").map((p) => p.trim());
  // "<street>, <city>, British Columbia, Canada" -> take the second-to-last-but-one segment.
  return parts.length >= 3 ? parts[parts.length - 3] ?? "Vancouver" : "Vancouver";
}

async function main(): Promise<void> {
  console.log("Launching headless browser...");
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) YaseenPrayerApp/1.0"
  );

  console.log(`Loading ${SITE_URL} ...`);
  await page.goto(SITE_URL, { waitUntil: "networkidle2" });
  const options = await readMasjidOptions(page);
  console.log(`Found ${options.length} masjids in the directory.`);

  const scraped: ScrapedMasjid[] = [];
  for (const option of options) {
    if (/^test masjid$/i.test(option.name)) continue; // exclude the site's placeholder test entry
    console.log(`Scraping "${option.name}"...`);
    const result = await scrapeMasjidPage(page, option.id, option.name);
    if (result) scraped.push(result);
    await sleep(400); // be a polite, low-frequency visitor
  }

  await browser.close();
  console.log(`Scraped ${scraped.length} masjid pages. Geocoding addresses via Nominatim...`);

  const output: OutputMosque[] = [];
  for (const masjid of scraped) {
    const coordinates = await geocodeAddress(masjid.address);
    output.push({
      id: masjid.id,
      name: masjid.name,
      address: masjid.address,
      city: extractCity(masjid.address),
      coordinates,
      organization: masjid.organization,
      website: masjid.website,
      prayerTimes: masjid.prayerTimes,
      jummah: masjid.jummah,
    });
    await sleep(1100); // respect Nominatim's 1 request/second usage policy
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(
    OUTPUT_PATH,
    JSON.stringify({ scrapedAt: new Date().toISOString(), mosques: output }, null, 2)
  );
  console.log(`Wrote ${output.length} mosques to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
