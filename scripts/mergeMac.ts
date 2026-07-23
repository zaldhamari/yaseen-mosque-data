/**
 * Standalone data-reconciliation script (run with `npm run merge:mac`).
 *
 * Reconciles the MAC-specific cache (src/data/macMosques.json, produced by
 * `npm run scrape:mac`) into the live app dataset (src/data/canadaMosques.json).
 * This is a deliberate, separate step from scraping itself — a bad or partial
 * MAC scrape only ever touches macMosques.json; running this script is the
 * one moment canadaMosques.json changes, so it's easy to review the diff
 * (`git diff src/data/canadaMosques.json`) before committing.
 *
 * What it does:
 *   1. For every MAC chapter, looks for an existing entry in canadaMosques.json
 *      that's plausibly the same physical mosque — either by website URL
 *      (macnet.ca/<slug>/) or by fuzzy match (same province + overlapping
 *      name tokens, or coordinates within 700m). This catches both the
 *      previously-broken `source: "mac"` placeholder entries AND independently
 *      -sourced duplicates (e.g. a manually-added entry for the same mosque
 *      pulled from a different directory site).
 *   2. If multiple existing entries match the same chapter, merges into ONE
 *      canonical record (keeps the first by array position, deletes the rest)
 *      so the dataset never carries duplicate pins for one physical mosque.
 *   3. If no match exists anywhere, adds it as a new entry.
 *   4. Never overwrites good existing data with worse/empty scraped data
 *      (e.g. a chapter whose prayer-time widget was unconfigured this run
 *      doesn't blank out previously-known prayer times).
 *
 * Run this after every `npm run scrape:mac`.
 */

import fs from "node:fs/promises";
import path from "node:path";

const CANADA_PATH = path.join(__dirname, "..", "src", "data", "canadaMosques.json");
const MAC_PATH = path.join(__dirname, "..", "src", "data", "macMosques.json");

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PrayerRow {
  salat: string;
  adhan: string;
  iqamah: string;
}

interface MacMosque {
  slug: string;
  name: string;
  province: string;
  city: string;
  address: string | null;
  coordinates: Coordinates | null;
  organization: string;
  website: string;
  phone: string | null;
  prayerTimes: PrayerRow[];
  jummah: string | null;
}

interface CanadaMosque {
  id: string;
  name: string;
  province: string;
  city: string;
  address: string;
  coordinates: Coordinates | null;
  organization: string | null;
  website: string | null;
  phone: string | null;
  prayerTimes: PrayerRow[];
  jummah: string | null;
  source: string;
  coordinatesApproximate?: boolean;
  [key: string]: unknown;
}

interface CanadaDataset {
  scrapedAt?: string;
  totalMosques: number;
  provinces: number;
  sources: string[];
  mosques: CanadaMosque[];
  manuallyUpdatedAt?: string;
}

const GENERIC_TOKENS = new Set([
  "the", "of", "and", "islamic", "centre", "center", "mosque", "masjid", "association",
  "society", "community", "canada", "canadian", "inc", "musallah", "musalla", "mosquee",
  "mosquée", "et", "de", "du", "la", "le", "al", "el", "for", "corp", "corporation", "org",
  "mac", "foundation", "institute", "cultural", "assn", "assoc", "dawah", "dawat", "e", "islami",
]);

function tokens(name: string | null | undefined): Set<string> {
  const cleaned = (name ?? "").toLowerCase().replace(/[^\w\s]/g, " ");
  return new Set(cleaned.split(/\s+/).filter((t) => t.length > 1 && !GENERIC_TOKENS.has(t)));
}

function haversineKm(a: Coordinates | null, b: Coordinates | null): number | null {
  if (!a || !b) return null;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function findMatches(mac: MacMosque, mosques: CanadaMosque[]): number[] {
  const matches: number[] = [];
  const macTokens = tokens(mac.name);
  const slugRe = mac.slug ? new RegExp(`macnet\\.ca/${mac.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i") : null;

  mosques.forEach((m, i) => {
    if (slugRe && slugRe.test(m.website ?? "")) {
      matches.push(i);
      return;
    }
    if (m.province !== mac.province) return;
    const overlap = jaccard(macTokens, tokens(m.name));
    const dist = haversineKm(mac.coordinates, m.coordinates);
    const close = dist !== null && dist <= 0.7;
    if (overlap >= 0.5 || close) matches.push(i);
  });

  return matches;
}

async function main(): Promise<void> {
  const [canadaRaw, macRaw] = await Promise.all([
    fs.readFile(CANADA_PATH, "utf-8"),
    fs.readFile(MAC_PATH, "utf-8"),
  ]);
  const dataset: CanadaDataset = JSON.parse(canadaRaw);
  const macData: { scrapedAt: string; mosques: MacMosque[] } = JSON.parse(macRaw);
  const mosques = dataset.mosques;

  let added = 0;
  let updated = 0;
  let dedupedAway = 0;
  const toRemove = new Set<number>();

  for (const mac of macData.mosques) {
    const matchIdxs = findMatches(mac, mosques);

    if (matchIdxs.length === 0) {
      mosques.push({
        id: `mac_${mac.slug}`,
        name: mac.name,
        province: mac.province,
        city: mac.city,
        address: mac.address ?? "",
        coordinates: mac.coordinates,
        organization: mac.organization,
        website: mac.website,
        phone: mac.phone,
        prayerTimes: mac.prayerTimes,
        jummah: mac.jummah,
        source: "mac",
      });
      added++;
      continue;
    }

    const primary = mosques[matchIdxs[0]];
    primary.name = mac.name;
    primary.city = mac.city || primary.city;
    primary.province = mac.province;
    if (mac.address) primary.address = mac.address;
    if (mac.coordinates) {
      primary.coordinates = mac.coordinates;
      delete primary.coordinatesApproximate;
    }
    primary.organization = mac.organization;
    primary.website = mac.website;
    if (mac.phone) primary.phone = mac.phone;
    if (mac.prayerTimes.length) primary.prayerTimes = mac.prayerTimes;
    if (mac.jummah) primary.jummah = mac.jummah;
    primary.source = "mac";
    updated++;

    for (const extraIdx of matchIdxs.slice(1)) {
      toRemove.add(extraIdx);
      dedupedAway++;
    }
  }

  const survivors = mosques.filter((_, i) => !toRemove.has(i));
  dataset.mosques = survivors;
  dataset.totalMosques = survivors.length;
  dataset.provinces = new Set(survivors.map((m) => m.province)).size;
  if (!dataset.sources.includes("mac")) dataset.sources.push("mac");
  dataset.manuallyUpdatedAt = new Date().toISOString();

  await fs.writeFile(CANADA_PATH, JSON.stringify(dataset, null, 2) + "\n");

  console.log(`MAC entries processed: ${macData.mosques.length}`);
  console.log(`  added new: ${added}`);
  console.log(`  updated existing (merged): ${updated}`);
  console.log(`  duplicate entries removed during merge: ${dedupedAway}`);
  console.log(`Final total mosques: ${survivors.length}`);
  console.log("Review the diff (git diff src/data/canadaMosques.json) before committing.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
