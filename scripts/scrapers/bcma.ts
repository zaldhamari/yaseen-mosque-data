/**
 * BC Muslim Association (thebcma.com) scraper.
 *
 * Static ASP.NET HTML — Cheerio only, no Puppeteer needed.
 * URL: https://thebcma.com/BranchProfile.aspx?BranchId={1..30}
 *
 * Each branch page has:
 *   - Prayer times table: #ctl00_Main_Prayer1_lstPrayerTimes
 *   - Address, phone in structured HTML
 *   - Jummah time embedded in the prayer table
 *
 * Advantage: publishes actual iqama times (not calculated).
 */

import * as cheerio from "cheerio";
import { CanadaMosque, PrayerRow, geocodeWithFallback, isShiaMosque, sleep, normalizeTime } from "./shared";

const BASE = "https://thebcma.com";
const SOURCE = "bcma";
// Probe IDs 1–35; some may be invalid or non-mosque entries
const MAX_BRANCH_ID = 35;

async function fetchBranchPage(id: number): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/BranchProfile.aspx?BranchId=${id}`, {
      headers: {
        "User-Agent": "YaseenPrayerApp/2.0 (BCMA mosque scraper; contact: zaki.alli2612@gmail.com)",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseBranchPage(html: string, branchId: number): CanadaMosque | null {
  const $ = cheerio.load(html);

  // Name — usually in the page heading or title
  const name = (
    $("h1, h2, .branch-name, #ctl00_Main_BranchName, .page-title").first().text().trim() ||
    $("title").text().replace(/\s*-\s*BCMA.*$/i, "").trim()
  );
  if (!name || /^BCMA|^BC Muslim Association|^Home$/i.test(name)) return null;
  if (isShiaMosque(name)) {
    console.log(`  [shia-skip] ${name}`);
    return null;
  }

  // Address
  const address = $(
    "#ctl00_Main_Address, .branch-address, [class*='address'], .address"
  ).first().text().trim();

  // Phone
  const phone =
    ($("a[href^='tel:']").first().attr("href")?.replace("tel:", "") ??
      $("[class*='phone'], .phone").first().text().trim()) || null;

  // Website
  const website = $("a[href^='http']:not([href*='bcma'])").first().attr("href") ?? null;

  // Prayer times table
  const prayerTimes: PrayerRow[] = [];
  let jummah: string | null = null;

  const tableSelector = "#ctl00_Main_Prayer1_lstPrayerTimes, table[id*='Prayer'], table[class*='prayer'], table[class*='salat']";
  $(tableSelector).find("tr").each((_, row) => {
    const cells = $(row).find("td, th");
    if (cells.length < 2) return;
    const label = $(cells[0]).text().trim();

    const PRAYER_MAP: Record<string, string> = {
      fajr: "Fajr", subh: "Fajr",
      sunrise: "Sunrise", shuruq: "Sunrise",
      dhuhr: "Dhuhr", zuhr: "Dhuhr",
      asr: "Asr",
      maghrib: "Maghrib", sunset: "Maghrib",
      isha: "Isha", isha_: "Isha",
    };

    const key = label.toLowerCase().replace(/[^a-z]/g, "");
    const prayerName = PRAYER_MAP[key];

    if (label.toLowerCase().includes("jum")) {
      const time = $(row).text().match(/\d{1,2}:\d{2}\s*[APap][Mm]/)?.[0];
      if (time) jummah = normalizeTime(time);
      return;
    }

    if (!prayerName) return;

    const times = $(row).text().match(/\d{1,2}:\d{2}\s*[APap][Mm]/g) ?? [];
    if (!times.length) return;

    prayerTimes.push({
      salat: prayerName,
      adhan: normalizeTime(times[0]),
      iqamah: times[1] ? normalizeTime(times[1]) : null,
    });
  });

  // Fallback: parse raw text if table selector missed
  if (prayerTimes.length === 0) {
    const text = $("body").text();
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    for (const p of prayers) {
      const match = text.match(
        new RegExp(`${p}[^\\n\\d]{0,20}(\\d{1,2}:\\d{2}\\s*[APap][Mm])`, "i")
      );
      if (match) prayerTimes.push({ salat: p, adhan: normalizeTime(match[1]), iqamah: null });
    }
  }

  return {
    id: `bcma_${branchId}`,
    name,
    province: "British Columbia",
    city: "",   // filled below via geocode result
    address,
    coordinates: null, // geocoded in main scraper
    organization: "BC Muslim Association",
    website,
    phone,
    prayerTimes,
    jummah,
    source: SOURCE,
  };
}

export async function scrapeBCMA(): Promise<CanadaMosque[]> {
  console.log("🕌 Scraping BCMA (thebcma.com)…");
  const mosques: CanadaMosque[] = [];

  for (let id = 1; id <= MAX_BRANCH_ID; id++) {
    console.log(`  Branch ${id}/${MAX_BRANCH_ID}`);
    const html = await fetchBranchPage(id);
    if (!html) { await sleep(400); continue; }

    const mosque = parseBranchPage(html, id);
    if (!mosque) { await sleep(400); continue; }

    // Geocode address
    if (mosque.address) {
      mosque.coordinates = await geocodeWithFallback(`${mosque.address}, British Columbia, Canada`);
      if (mosque.coordinates) {
        await sleep(1100); // Nominatim 1 req/s
      }
    }

    console.log(`  ✓ ${mosque.name} — ${mosque.prayerTimes.length} prayer rows`);
    mosques.push(mosque);
    await sleep(600);
  }

  console.log(`✓ BCMA: ${mosques.length} branches scraped`);
  return mosques;
}
