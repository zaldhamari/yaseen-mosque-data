/**
 * Canada-wide mosque scraper — orchestrates all sources.
 *
 * Sources (in order):
 *   1. OpenStreetMap Overpass API  — mosque locations for all of Canada
 *   2. BC Muslim Association (BCMA) — BC-only, provides actual iqama times
 *   3. awqat.net (existing)        — BC-only, provides actual iqama times
 *
 * Deduplication: mosques within 150 m of each other are merged, preferring
 * BCMA/awqat data for prayer times (actual iqama) over OSM (no iqama).
 *
 * Output: src/data/canadaMosques.json
 *
 * Run:
 *   npm run scrape:canada
 *   npm run scrape:canada -- --province=bc       # BC only (quick test)
 *   npm run scrape:canada -- --skip-osm          # skip Overpass (reuse existing)
 *
 * Notes:
 *   - Adhan prayer times are NOT stored — the adhan library calculates them
 *     at runtime from coordinates + user's calculation method.
 *   - Only iqama times (mosque-specific) are stored.
 *   - Prayer times from awqat.net/BCMA are kept as-scraped "last known" values.
 */

import fs from "node:fs/promises";
import path from "node:path";

import { fetchOverpassMosques } from "./scrapers/overpass";
import { scrapeBCMA } from "./scrapers/bcma";
import { scrapeMAC } from "./scrapers/mac";
import { scrapeICNA } from "./scrapers/icna";
import { getBCMosques } from "./scrapers/bc_hardcoded";
import { getCanadaMosques } from "./scrapers/canada_hardcoded";
import type { CanadaMosque, PrayerRow } from "./scrapers/shared";
import { isShiaMosque } from "./scrapers/shared";

// ── Hardcoded additions — locations that can't be scraped ────────────────────
const HARDCODED_MOSQUES: CanadaMosque[] = [
  // ISNA Canada — Cloudflare blocks all automated scraping
  {
    id: "hardcoded_isna_mississauga",
    name: "ISNA Islamic Centre",
    province: "Ontario",
    city: "Mississauga",
    address: "2200 South Sheridan Way, Mississauga, ON L5J 2M4",
    coordinates: { latitude: 43.5139, longitude: -79.6471 },
    organization: "Islamic Society of North America Canada",
    website: "https://isnacanada.com",
    phone: null,
    prayerTimes: [],
    jummah: null,
    source: "hardcoded",
  },
];

const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "canadaMosques.json");
const AWQAT_PATH = path.join(__dirname, "..", "src", "data", "vancouverMosques.json");

// ── Haversine distance (metres) ──────────────────────────────────────────────
function distanceM(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// ── Load existing awqat.net data ─────────────────────────────────────────────
interface AwqatMosque {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: { latitude: number; longitude: number } | null;
  organization: string | null;
  website: string | null;
  prayerTimes: PrayerRow[];
  jummah: string | null;
}

async function loadAwqatData(): Promise<CanadaMosque[]> {
  try {
    const raw = JSON.parse(await fs.readFile(AWQAT_PATH, "utf8")) as {
      mosques: AwqatMosque[];
    };
    return raw.mosques
      .filter((m) => !isShiaMosque(m.name))
      .map((m) => ({
        id: `awqat_${m.id}`,
        name: m.name,
        province: "British Columbia",
        city: m.city,
        address: m.address,
        coordinates: m.coordinates,
        organization: m.organization,
        website: m.website,
        phone: null,
        prayerTimes: m.prayerTimes,
        jummah: m.jummah,
        source: "awqat",
      }));
  } catch {
    console.warn("⚠️  No existing awqat.net data found — skipping.");
    return [];
  }
}

// ── Deduplication ─────────────────────────────────────────────────────────────
// Priority: awqat > bcma > osm (for iqama data quality)
const SOURCE_PRIORITY: Record<string, number> = {
  awqat: 4,
  bcma: 3,
  mac: 3,
  icna: 3,
  openstreetmap: 1,
  islamicfinder: 1,
  bc_hardcoded: 0,
  hardcoded: 0,
};

function mergeMosques(all: CanadaMosque[]): CanadaMosque[] {
  const DEDUP_RADIUS_M = 200; // mosques within 200 m are considered the same
  const merged: CanadaMosque[] = [];

  for (const mosque of all) {
    if (!mosque.coordinates) {
      merged.push(mosque);
      continue;
    }

    const existing = merged.find(
      (m) =>
        m.coordinates &&
        distanceM(m.coordinates, mosque.coordinates!) < DEDUP_RADIUS_M
    );

    if (!existing) {
      merged.push(mosque);
      continue;
    }

    // Merge — prefer the higher-priority source for iqama data
    const incomingPriority = SOURCE_PRIORITY[mosque.source] ?? 0;
    const existingPriority = SOURCE_PRIORITY[existing.source] ?? 0;

    if (incomingPriority > existingPriority) {
      // Replace with higher-quality data but keep the better coordinates
      Object.assign(existing, mosque);
    } else {
      // Keep existing but fill in missing fields
      if (!existing.prayerTimes.length && mosque.prayerTimes.length) {
        existing.prayerTimes = mosque.prayerTimes;
      }
      if (!existing.jummah && mosque.jummah) existing.jummah = mosque.jummah;
      if (!existing.address && mosque.address) existing.address = mosque.address;
      if (!existing.website && mosque.website) existing.website = mosque.website;
      if (!existing.phone && mosque.phone) existing.phone = mosque.phone;
    }
  }

  return merged;
}

// ── CLI args ─────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    skipOsm: args.includes("--skip-osm"),
    skipBcma: args.includes("--skip-bcma"),
    skipMac: args.includes("--skip-mac"),
    skipIcna: args.includes("--skip-icna"),
    skipAwqat: args.includes("--skip-awqat"),
    provinces: args
      .find((a) => a.startsWith("--province="))
      ?.replace("--province=", "")
      .split(","),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs();
  console.log("🇨🇦 Yaseen Canada-wide mosque scraper\n");

  const all: CanadaMosque[] = [];

  // 0. Hardcoded base layer — all provinces (lowest priority).
  //    Loaded first so higher-priority scraped data can override via dedup.
  const bcBase = getBCMosques();
  const canadaBase = getCanadaMosques();
  all.push(...bcBase);
  all.push(...canadaBase);
  all.push(...HARDCODED_MOSQUES);
  console.log(`  Hardcoded base: ${bcBase.length} BC + ${canadaBase.length} other provinces + ${HARDCODED_MOSQUES.length} additions\n`);

  // 1. OpenStreetMap — all Canadian mosque locations
  if (!opts.skipOsm) {
    try {
      const osm = await fetchOverpassMosques();
      console.log(`  OSM: ${osm.length} mosques\n`);
      all.push(...osm);
    } catch (e) {
      console.error("❌ Overpass API failed:", e);
      console.log("   Continuing without OSM data…\n");
    }
  }

  // 2. BCMA — BC mosques with real iqama times
  if (!opts.skipBcma) {
    const bcma = await scrapeBCMA();
    all.push(...bcma);
    console.log(`  BCMA: ${bcma.length} branches\n`);
  }

  // 3. MAC — 23 centres across AB/ON/QC/BC with athan + iqama times
  if (!opts.skipMac) {
    try {
      const mac = await scrapeMAC();
      all.push(...mac);
      console.log(`  MAC: ${mac.length} centres\n`);
    } catch (e) {
      console.error("❌ MAC scraper failed:", e);
    }
  }

  // 4. ICNA — 10 locations across ON/AB/NL with iqama times
  if (!opts.skipIcna) {
    try {
      const icna = await scrapeICNA();
      all.push(...icna);
      console.log(`  ICNA: ${icna.length} locations\n`);
    } catch (e) {
      console.error("❌ ICNA scraper failed:", e);
    }
  }

  // 5. awqat.net existing data — BC mosques with real iqama times
  if (!opts.skipAwqat) {
    const awqat = await loadAwqatData();
    all.push(...awqat);
    console.log(`  awqat.net (existing): ${awqat.length} mosques\n`);
  }

  // 4. Deduplicate
  console.log(`📊 Total before dedup: ${all.length}`);
  const deduped = mergeMosques(all);
  console.log(`📊 After dedup: ${deduped.length} unique mosques\n`);

  // 5. Province summary
  const byProvince: Record<string, number> = {};
  for (const m of deduped) {
    byProvince[m.province] = (byProvince[m.province] ?? 0) + 1;
  }
  console.log("Province breakdown:");
  Object.entries(byProvince)
    .sort(([, a], [, b]) => b - a)
    .forEach(([p, n]) => console.log(`  ${p}: ${n}`));

  // 6. Write output
  const output = {
    scrapedAt: new Date().toISOString(),
    totalMosques: deduped.length,
    provinces: Object.keys(byProvince).length,
    sources: ["bc_hardcoded", "hardcoded", "openstreetmap", "bcma", "mac", "icna", "awqat"],
    mosques: deduped,
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\n✅  Wrote ${deduped.length} mosques to ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
