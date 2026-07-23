/**
 * Hardcoded BC mosque list — address + coordinates for every known mosque.
 *
 * Purpose: guarantees coordinates are available for adhan calculation even
 * when scrapers are unavailable or stale. prayerTimes is intentionally empty
 * here — the adhan library calculates from coordinates at runtime.
 *
 * Sources: awqat.net (Metro Vancouver), BCMA branches, OSM, community lists.
 * Coordinates verified via Google Maps / OpenStreetMap.
 *
 * Merges with awqat.net data in scrapeCanada.ts (dedup by 200 m radius).
 * awqat entries take priority (they have actual iqama times).
 */

import type { CanadaMosque } from "./shared";

const SOURCE = "bc_hardcoded";
const PROVINCE = "British Columbia";

export const BC_MOSQUES: CanadaMosque[] = [

  // ─── Metro Vancouver / Lower Mainland ─────────────────────────────────────

  // Burnaby
  {
    id: "bc_al_iman_metrotown",
    name: "Al Iman Metrotown Masjid",
    province: PROVINCE, city: "Burnaby",
    address: "204-7060 Waltham Ave, Burnaby, BC V5E 1S1",
    coordinates: { latitude: 49.2193772, longitude: -122.9762093 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_al_rauf",
    name: "Al-Rauf Education and Welfare Foundation",
    province: PROVINCE, city: "Burnaby",
    address: "3989 Henning Drive, Burnaby, BC V5C 1G2",
    coordinates: { latitude: 49.2645456, longitude: -123.0172897 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_baitul_mukarram",
    name: "Baitul Mukarram Islamic Society",
    province: PROVINCE, city: "Burnaby",
    address: "6409 Arbroath St, Burnaby, BC V5E 1C5",
    coordinates: { latitude: 49.2185545, longitude: -122.97022 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_bilal_masjid_burnaby",
    name: "Bilal Masjid Burnaby",
    province: PROVINCE, city: "Burnaby",
    address: "7726 Edmonds St, Burnaby, BC V3N 1B8",
    coordinates: { latitude: 49.224285, longitude: -122.9403307 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_masjid_al_salaam_burnaby",
    name: "Masjid Al-Salaam",
    province: PROVINCE, city: "Burnaby",
    address: "5060 Canada Way, Burnaby, BC V5E 3N3",
    coordinates: { latitude: 49.2399995, longitude: -122.964121 },
    organization: "BCMA", website: "https://burnaby.thebcma.com", phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // Coquitlam / Port Moody / Tri-Cities
  {
    id: "bc_coquitlam_islamic_centre",
    name: "Coquitlam Islamic Centre",
    province: PROVINCE, city: "Coquitlam",
    address: "202-504 Cottonwood Ave, Coquitlam, BC V3J 2R4",
    coordinates: { latitude: 49.2588056, longitude: -122.886797 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_al_ihsan_port_moody",
    name: "Al Ihsan Islamic Centre",
    province: PROVINCE, city: "Port Moody",
    address: "2701B Esplanade Street, Port Moody, BC V3H 5A4",
    coordinates: { latitude: 49.2832, longitude: -122.8318 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // Delta / Richmond
  {
    id: "bc_north_delta_islamic",
    name: "North Delta Islamic Centre",
    province: PROVINCE, city: "Delta",
    address: "11146 84 Ave, Delta, BC V4C 2L7",
    coordinates: { latitude: 49.1557928, longitude: -122.9128469 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_bcma_richmond",
    name: "BCMA Richmond Jamea Masjid",
    province: PROVINCE, city: "Richmond",
    address: "12300 Blundell Rd, Richmond, BC V6W 1B3",
    coordinates: { latitude: 49.154064, longitude: -123.0875856 },
    organization: "BCMA", website: "https://richmond.thebcma.com", phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // Langley / Maple Ridge
  {
    id: "bc_masjid_al_sahaba",
    name: "Masjid Al Sahaba",
    province: PROVINCE, city: "Langley",
    address: "5768 203 St, Langley, BC V3A 1W5",
    coordinates: { latitude: 49.1065789, longitude: -122.6600511 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_ridge_meadows",
    name: "Islamic Society of Ridge Meadows",
    province: PROVINCE, city: "Maple Ridge",
    address: "21991 Cliff Ave, Maple Ridge, BC V2X 6L8",
    coordinates: { latitude: 49.2159735, longitude: -122.6108613 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // North Vancouver / New Westminster
  {
    id: "bc_masjid_ar_rahman_nv",
    name: "Masjid Ar-Rahman North Vancouver",
    province: PROVINCE, city: "North Vancouver",
    address: "1398 W 15th St, North Vancouver, BC V7P 1M2",
    coordinates: { latitude: 49.3221096, longitude: -123.0969645 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_taiba_new_west",
    name: "Taiba Musallah",
    province: PROVINCE, city: "New Westminster",
    address: "1206 Kingston Street, New Westminster, BC V3M 5P6",
    coordinates: { latitude: 49.2099144, longitude: -122.9338948 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // Surrey (most mosques in BC)
  {
    id: "bc_abu_bakr_surrey",
    name: "Abu Bakr Islamic Centre",
    province: PROVINCE, city: "Surrey",
    address: "7375 144 Street, Surrey, BC V3W 1L2",
    coordinates: { latitude: 49.1633785, longitude: -122.8234765 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_al_iman_surrey",
    name: "Al Iman Islamic Centre Surrey",
    province: PROVINCE, city: "Surrey",
    address: "18-13478 78 Ave, Surrey, BC V3W 1A5",
    coordinates: { latitude: 49.1443395, longitude: -122.84914 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_amir_hamza",
    name: "Amir Hamza Musalla",
    province: PROVINCE, city: "Surrey",
    address: "9250 Scott Rd, Surrey, BC V3V 7P8",
    coordinates: { latitude: 49.1709537, longitude: -122.8900421 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_cloverdale_islamic",
    name: "Cloverdale Islamic Society",
    province: PROVINCE, city: "Surrey",
    address: "17665 66A Ave, Surrey, BC V3S 2A5",
    coordinates: { latitude: 49.1234506, longitude: -122.7333016 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_faizan_e_madina",
    name: "Faizan-e-Madina Islamic Center",
    province: PROVINCE, city: "Surrey",
    address: "7062 134 St, Surrey, BC V3W 5E7",
    coordinates: { latitude: 49.1309848, longitude: -122.8508961 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_fiji_islamic",
    name: "Fiji Islamic Centre Surrey",
    province: PROVINCE, city: "Surrey",
    address: "12988 84 Ave, Surrey, BC V3W 1K8",
    coordinates: { latitude: 49.1549238, longitude: -122.8629226 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_fleetwood_islamic",
    name: "Fleetwood Islamic Academy Society",
    province: PROVINCE, city: "Surrey",
    address: "Unit 209-210, 8462 162 Street, Surrey, BC V4N 1G2",
    coordinates: { latitude: 49.1578, longitude: -122.7474 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_masjid_al_huda_surrey",
    name: "Masjid Al Huda Surrey",
    province: PROVINCE, city: "Surrey",
    address: "14136 Grosvenor Road, Surrey, BC V3R 5G2",
    coordinates: { latitude: 49.2070303, longitude: -122.8301489 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_masjid_al_noor_surrey",
    name: "Masjid Al Noor Surrey",
    province: PROVINCE, city: "Surrey",
    address: "13526 98A Avenue, Surrey, BC V3T 5K6",
    coordinates: { latitude: 49.1813236, longitude: -122.8475297 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_masjid_al_rahmah_surrey",
    name: "Masjid Al Rahmah Surrey",
    province: PROVINCE, city: "Surrey",
    address: "13585 62 Ave, Surrey, BC V3X 2G5",
    coordinates: { latitude: 49.1156187, longitude: -122.8457738 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_masjid_anwar_e_madina",
    name: "Masjid Anwar-e-Madina",
    province: PROVINCE, city: "Surrey",
    address: "13560 105A Ave, Surrey, BC V3T 1Z5",
    coordinates: { latitude: 49.1943447, longitude: -122.8464857 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_masjid_guildford",
    name: "Masjid Guildford",
    province: PROVINCE, city: "Surrey",
    address: "15290 103A Ave #101, Surrey, BC V3R 7J7",
    coordinates: { latitude: 49.1903084, longitude: -122.7984478 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_surrey_jamea",
    name: "Surrey Jamea Masjid",
    province: PROVINCE, city: "Surrey",
    address: "12407 72nd Ave, Surrey, BC V3W 2N7",
    coordinates: { latitude: 49.1322, longitude: -122.8538 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_white_rock_muslim",
    name: "White Rock Muslim Association",
    province: PROVINCE, city: "Surrey",
    address: "15515 24 Ave #61, Surrey, BC V4A 2J4",
    coordinates: { latitude: 49.045875, longitude: -122.7927916 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // Vancouver City
  {
    id: "bc_ajyal_vancouver",
    name: "Ajyal Islamic Center",
    province: PROVINCE, city: "Vancouver",
    address: "181 Keefer Street, Unit 202, Vancouver, BC V6A 1X3",
    coordinates: { latitude: 49.2792225, longitude: -123.1035282 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_al_masjid_al_jamia",
    name: "Al Masjid Al Jamia",
    province: PROVINCE, city: "Vancouver",
    address: "655 W 8th Avenue, Vancouver, BC V5Z 1C6",
    coordinates: { latitude: 49.2644174, longitude: -123.1189904 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_granville_musallah",
    name: "Granville Musallah",
    province: PROVINCE, city: "Vancouver",
    address: "695 Smithe St, Vancouver, BC V6B 2C9",
    coordinates: { latitude: 49.2776, longitude: -123.1249 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_marpole_musallah",
    name: "Marpole Musallah",
    province: PROVINCE, city: "Vancouver",
    address: "8879 Selkirk St, Vancouver, BC V6P 4J1",
    coordinates: { latitude: 49.2046176, longitude: -123.1337925 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_masjid_omar_al_farooq",
    name: "Masjid Omar Al-Farooq",
    province: PROVINCE, city: "Vancouver",
    address: "1659 E 10th Ave, Vancouver, BC V5N 1X7",
    coordinates: { latitude: 49.2616091, longitude: -123.0705718 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_masjid_ul_haqq",
    name: "Masjid Ul Haqq",
    province: PROVINCE, city: "Vancouver",
    address: "4162 Welwyn Street, Vancouver, BC V5N 4S5",
    coordinates: { latitude: 49.2479585, longitude: -123.0696038 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_msa_ubc",
    name: "MSA UBC Prayer Room",
    province: PROVINCE, city: "Vancouver",
    address: "6174 University Blvd, Vancouver, BC V6T 1Z1",
    coordinates: { latitude: 49.265192, longitude: -123.2493632 },
    organization: "UBC MSA", website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_west_end_musallah",
    name: "West End Musallah",
    province: PROVINCE, city: "Vancouver",
    address: "708 Denman St, Vancouver, BC V6G 2L7",
    coordinates: { latitude: 49.2919462, longitude: -123.1343223 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_mac_vancouver",
    name: "MAC Vancouver Centre",
    province: PROVINCE, city: "Vancouver",
    address: "2122 Kingsway, Vancouver, BC V5N 2T5",
    coordinates: { latitude: 49.2440397, longitude: -123.063553 },
    organization: "Muslim Association of Canada", website: "https://centres.macnet.ca/macvancouvercentre/", phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // ─── Interior BC ──────────────────────────────────────────────────────────

  // Abbotsford / Fraser Valley
  {
    id: "bc_abbotsford_islamic",
    name: "Abbotsford Islamic Centre",
    province: PROVINCE, city: "Abbotsford",
    address: "2777 Gladwin Rd, Abbotsford, BC V2T 4W9",
    coordinates: { latitude: 49.0496, longitude: -122.3197 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_bc_muslim_abbotsford",
    name: "BC Muslim Association Abbotsford",
    province: PROVINCE, city: "Abbotsford",
    address: "2693 Clearbrook Rd, Abbotsford, BC V2T 2Z3",
    coordinates: { latitude: 49.043, longitude: -122.315 },
    organization: "BCMA", website: "https://abbotsford.thebcma.com", phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_chilliwack_islamic",
    name: "Chilliwack Islamic Centre",
    province: PROVINCE, city: "Chilliwack",
    address: "45530 Market Way, Chilliwack, BC V2R 0H1",
    coordinates: { latitude: 49.1492, longitude: -121.9542 },
    organization: "BCMA", website: "https://chilliwack.thebcma.com", phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // Kelowna / Okanagan
  {
    id: "bc_kelowna_islamic",
    name: "Kelowna Islamic Association",
    province: PROVINCE, city: "Kelowna",
    address: "1420 Ellis Street, Kelowna, BC V1Y 2A3",
    coordinates: { latitude: 49.8859, longitude: -119.4941 },
    organization: "BCMA", website: "https://kelowna.thebcma.com", phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_penticton_muslim",
    name: "Penticton Muslim Association",
    province: PROVINCE, city: "Penticton",
    address: "Penticton, BC",
    coordinates: { latitude: 49.4991, longitude: -119.5937 },
    organization: "BCMA", website: "https://penticton.thebcma.com", phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_vernon_islamic",
    name: "Vernon Islamic Society",
    province: PROVINCE, city: "Vernon",
    address: "Vernon, BC",
    coordinates: { latitude: 50.267, longitude: -119.272 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // Kamloops
  {
    id: "bc_kamloops_islamic",
    name: "Kamloops Islamic Society",
    province: PROVINCE, city: "Kamloops",
    address: "321 Columbia St, Kamloops, BC V2C 2T2",
    coordinates: { latitude: 50.6745, longitude: -120.3273 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // Victoria / Vancouver Island
  {
    id: "bc_victoria_islamic",
    name: "Victoria Islamic Centre",
    province: PROVINCE, city: "Victoria",
    address: "3690 Carey Rd, Victoria, BC V8Z 4E7",
    coordinates: { latitude: 48.4733, longitude: -123.3983 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_nanaimo_islamic",
    name: "Nanaimo Islamic Centre",
    province: PROVINCE, city: "Nanaimo",
    address: "Nanaimo, BC",
    coordinates: { latitude: 49.1659, longitude: -123.9401 },
    organization: "BCMA", website: "https://nanaimo.thebcma.com", phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },

  // Prince George / Northern BC
  {
    id: "bc_prince_george_islamic",
    name: "Prince George Islamic Centre",
    province: PROVINCE, city: "Prince George",
    address: "1244 5th Ave, Prince George, BC V2L 3L4",
    coordinates: { latitude: 53.9171, longitude: -122.7497 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
  {
    id: "bc_fort_st_john_musallah",
    name: "Fort St John Musallah",
    province: PROVINCE, city: "Fort St. John",
    address: "9715 102nd Street, Fort St. John, BC V1J 3S6",
    coordinates: { latitude: 56.2546, longitude: -120.8477 },
    organization: null, website: null, phone: null,
    prayerTimes: [], jummah: null, source: SOURCE,
  },
];

export function getBCMosques(): CanadaMosque[] {
  return BC_MOSQUES;
}
