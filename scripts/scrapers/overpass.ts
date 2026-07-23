/**
 * OpenStreetMap Overpass API — fetches all mosques in Canada.
 *
 * Uses tagged amenity=place_of_worship + religion=muslim. Returns nodes,
 * ways, and relations; way/relation coordinates are taken from the
 * Overpass `center` field. Filters out Shia mosques via denomination tag
 * and name keywords.
 *
 * No rate limit beyond a 60s query timeout — the entire country fits in
 * one request. Free, no API key needed.
 */

import { CanadaMosque, isShiaMosque, sleep } from "./shared";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const SOURCE = "openstreetmap";

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function buildQuery(): string {
  // Use Canada's administrative area relation instead of a bbox to exclude US border mosques.
  //
  // Catches all common OSM mosque tagging variants:
  //   - amenity=place_of_worship + religion=muslim   (most common)
  //   - amenity=place_of_worship + religion=islam    (alternate spelling used by some mappers)
  //   - building=mosque                              (tagged by building type, not amenity)
  //   - amenity=place_of_worship + building=mosque   (dual-tagged)
  //
  // Name filter removed — some mosques only have name:ar or name:ur tags.
  // Unnamed entries are filtered client-side after checking all name variants.
  return `
[out:json][timeout:180];
area["ISO3166-1"="CA"]["admin_level"="2"]->.canada;
(
  node["amenity"="place_of_worship"]["religion"="muslim"](area.canada);
  way["amenity"="place_of_worship"]["religion"="muslim"](area.canada);
  relation["amenity"="place_of_worship"]["religion"="muslim"](area.canada);
  node["amenity"="place_of_worship"]["religion"="islam"](area.canada);
  way["amenity"="place_of_worship"]["religion"="islam"](area.canada);
  relation["amenity"="place_of_worship"]["religion"="islam"](area.canada);
  node["building"="mosque"](area.canada);
  way["building"="mosque"](area.canada);
  relation["building"="mosque"](area.canada);
);
out center tags;
  `.trim();
}

function resolveCoords(el: OverpassElement): { latitude: number; longitude: number } | null {
  if (el.lat !== undefined && el.lon !== undefined) {
    return { latitude: el.lat, longitude: el.lon };
  }
  if (el.center) {
    return { latitude: el.center.lat, longitude: el.center.lon };
  }
  return null;
}

function buildAddress(tags: Record<string, string>): string {
  const parts: string[] = [];
  if (tags["addr:housenumber"] && tags["addr:street"]) {
    parts.push(`${tags["addr:housenumber"]} ${tags["addr:street"]}`);
  } else if (tags["addr:street"]) {
    parts.push(tags["addr:street"]);
  }
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (tags["addr:province"] || tags["addr:state"]) {
    parts.push(tags["addr:province"] || tags["addr:state"]);
  }
  return parts.join(", ");
}

// Province abbreviation → full name
const PROVINCE_ABBR: Record<string, string> = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba",
  NB: "New Brunswick", NL: "Newfoundland and Labrador", NS: "Nova Scotia",
  NT: "Northwest Territories", NU: "Nunavut", ON: "Ontario",
  PE: "Prince Edward Island", QC: "Quebec", SK: "Saskatchewan", YT: "Yukon",
};

const CANADIAN_PROVINCES = new Set(Object.values(PROVINCE_ABBR));

function resolveProvince(tags: Record<string, string>): string {
  const raw = tags["addr:province"] || tags["addr:state"] || "";
  const full = PROVINCE_ABBR[raw.toUpperCase()] || raw;
  // Drop obviously non-Canadian province tags (US states, etc.)
  if (full && !CANADIAN_PROVINCES.has(full)) return "Canada";
  return full || "Canada";
}

export async function fetchOverpassMosques(retries = 3): Promise<CanadaMosque[]> {
  const query = buildQuery();
  console.log("📡 Querying OpenStreetMap Overpass API for all Canadian mosques…");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "YaseenPrayerApp/2.0 (Canada mosque scraper; contact: zaki.alli2612@gmail.com)",
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as OverpassResponse;

      const mosques: CanadaMosque[] = [];
      let shiaSkipped = 0;

      // Deduplicate OSM elements — building=mosque entries often overlap with
      // amenity=place_of_worship entries for the same physical location.
      const seenOsmIds = new Set<string>();

      for (const el of json.elements) {
        const tags = el.tags ?? {};

        // Resolve best available name across all language variants
        const name =
          tags.name ||
          tags["name:en"] ||
          tags["name:ur"] ||
          tags["name:ar"] ||
          tags["name:fr"] ||
          tags["alt_name"] ||
          tags["official_name"] ||
          "";
        if (!name) continue;

        // Skip unnamed musallas / prayer rooms with no identifying info
        if (/^(mosque|masjid|musalla|prayer\s*room|islamic\s*centre?)$/i.test(name.trim())) {
          // Generic placeholder name — keep if it has an address, skip otherwise
          if (!tags["addr:street"] && !tags["addr:housenumber"]) continue;
        }

        // Shia filter: denomination tag takes precedence, then name keywords
        const denomination = (tags.denomination || "").toLowerCase();
        if (denomination.includes("shia") || denomination.includes("shi'a") ||
            denomination.includes("ismaili") || denomination.includes("jafari")) {
          shiaSkipped++;
          continue;
        }
        if (isShiaMosque(name)) {
          shiaSkipped++;
          continue;
        }

        const coordinates = resolveCoords(el);
        const address = buildAddress(tags);
        const province = resolveProvince(tags);
        const city = tags["addr:city"] || "";

        // Dedup: same OSM element can appear twice if tagged both building=mosque
        // and amenity=place_of_worship (both queries match it)
        const dedupeKey = `${el.type}_${el.id}`;
        if (seenOsmIds.has(dedupeKey)) continue;
        seenOsmIds.add(dedupeKey);

        mosques.push({
          id: `osm_${el.type}_${el.id}`,
          name,
          province,
          city,
          address,
          coordinates,
          organization: tags.operator || null,
          website: tags.website || tags["contact:website"] || null,
          phone: tags.phone || tags["contact:phone"] || null,
          prayerTimes: [], // filled by Aladhan or BC scrapers
          jummah: null,    // filled by BC scrapers where available
          source: SOURCE,
        });
      }

      console.log(
        `✓ Overpass: ${mosques.length} mosques collected, ${shiaSkipped} Shia skipped`
      );
      return mosques;
    } catch (e) {
      if (attempt < retries) {
        console.warn(`  ! Overpass attempt ${attempt} failed: ${(e as Error).message}. Retrying in 5s…`);
        await sleep(5000);
      } else {
        throw e;
      }
    }
  }

  return [];
}
