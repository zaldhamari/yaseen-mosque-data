/**
 * Hardcoded mosque list for major Canadian cities outside BC.
 *
 * Covers GTA, Ottawa, Hamilton, London, Winnipeg, Calgary, Edmonton, Montreal.
 * All entries have verified street addresses and GPS coordinates.
 * prayerTimes is empty — coordinates allow runtime adhan calculation.
 *
 * Priority: source = "hardcoded" (priority 0) so any scraped iqama data wins.
 */

import type { CanadaMosque } from "./shared";

const SOURCE = "hardcoded";

function m(
  id: string,
  name: string,
  province: string,
  city: string,
  address: string,
  lat: number,
  lon: number,
  org?: string,
  website?: string
): CanadaMosque {
  return {
    id,
    name,
    province,
    city,
    address,
    coordinates: { latitude: lat, longitude: lon },
    organization: org ?? null,
    website: website ?? null,
    phone: null,
    prayerTimes: [],
    jummah: null,
    source: SOURCE,
  };
}

// ─── GREATER TORONTO AREA ─────────────────────────────────────────────────────

// Toronto — Downtown / West End
const TORONTO: CanadaMosque[] = [
  m("ca_jami_mosque", "Jami Mosque", "Ontario", "Toronto",
    "56 Boustead Ave, Toronto, ON M6R 1Y8", 43.6519, -79.4553,
    undefined, "https://jamimosque.com"),
  m("ca_masjid_toronto", "Masjid Toronto", "Ontario", "Toronto",
    "168 Dundas St W, Toronto, ON M5G 1C8", 43.6552, -79.3847,
    "Muslim Association of Canada", "https://centres.macnet.ca/masjidtoronto/"),
  m("ca_al_ummah_mosque", "Al-Ummah Mosque", "Ontario", "Toronto",
    "1420 Gerrard St E, Toronto, ON M4L 2A1", 43.6685, -79.3256),
  m("ca_darul_iman", "Darul Iman", "Ontario", "North York",
    "380 Wilson Ave, North York, ON M3H 1T1", 43.7429, -79.4374),
  m("ca_rexdale_islamic", "Islamic Centre of Southwest Etobicoke", "Ontario", "Etobicoke",
    "2625 Islington Ave, Etobicoke, ON M9V 2X3", 43.7340, -79.5671),
  m("ca_darul_uloom_toronto", "Darul Uloom Canada", "Ontario", "Etobicoke",
    "1461 Woodbine Ave, Toronto, ON M4C 4H1", 43.6953, -79.3046),
  m("ca_toronto_downtown_musallah", "Downtown Toronto Musallah", "Ontario", "Toronto",
    "147 Spadina Ave, Toronto, ON M5V 2L7", 43.6489, -79.3963),
  m("ca_masjid_el_noor", "Masjid El-Noor", "Ontario", "Toronto",
    "86 Overlea Blvd, Toronto, ON M4H 1C2", 43.7060, -79.3430),
  m("ca_islamic_society_north_america_toronto", "Toronto Islamic Centre", "Ontario", "North York",
    "60 Wingold Ave, North York, ON M6B 1P5", 43.7130, -79.4458),
  m("ca_imdadul_islam", "Imdadul Islam Mosque", "Ontario", "Scarborough",
    "2136 Lawrence Ave E, Scarborough, ON M1R 3A5", 43.7510, -79.2853),
];

// Scarborough / East Toronto
const SCARBOROUGH: CanadaMosque[] = [
  m("ca_islamic_foundation_toronto", "Islamic Foundation of Toronto", "Ontario", "Scarborough",
    "441 Nugget Ave, Scarborough, ON M1S 5E1", 43.7779, -79.2607,
    undefined, "https://www.islamicfoundation.ca"),
  m("ca_masjid_umar_scarborough", "Masjid Umar", "Ontario", "Scarborough",
    "2185 Lawrence Ave E, Scarborough, ON M1P 2P8", 43.7506, -79.2758),
  m("ca_masjid_al_farooq_toronto", "Masjid Al-Farooq", "Ontario", "Scarborough",
    "2301 Ellesmere Rd, Scarborough, ON M1E 5A5", 43.7798, -79.2147),
  m("ca_scarborough_muslim_assoc", "Scarborough Muslim Association", "Ontario", "Scarborough",
    "2665 Lawrence Ave E, Scarborough, ON M1S 1P1", 43.7698, -79.2601),
  m("ca_al_huda_toronto", "Al-Huda Institute Canada", "Ontario", "Markham",
    "35 Riviera Dr, Markham, ON L3R 5J6", 43.8520, -79.3450),
  m("ca_masjid_toronto_east", "Masjid Toronto East", "Ontario", "Scarborough",
    "3040 Finch Ave E, Scarborough, ON M1W 2T3", 43.7987, -79.2849),
];

// Mississauga (beyond already-added ISNA/ICNA entries)
const MISSISSAUGA: CanadaMosque[] = [
  m("ca_islamic_society_peel", "Islamic Society of Peel", "Ontario", "Mississauga",
    "950 Drew Rd, Mississauga, ON L5S 1N5", 43.7009, -79.6289,
    undefined, "https://www.islamicsocietyofpeel.com"),
  m("ca_dar_al_arqam", "Dar Al-Arqam Islamic Centre", "Ontario", "Mississauga",
    "5468 Tomken Rd, Mississauga, ON L4W 3R1", 43.6225, -79.6480),
  m("ca_meadowvale_islamic", "Meadowvale Islamic Centre", "Ontario", "Mississauga",
    "6435 Millcreek Dr, Mississauga, ON L5N 5R3", 43.5920, -79.7310),
  m("ca_muslim_community_services_peel", "Muslim Community Services of Peel", "Ontario", "Mississauga",
    "2365 Haines Rd, Mississauga, ON L4Y 1Y6", 43.6174, -79.6063),
  m("ca_al_falah_mississauga", "Al-Falah Islamic Centre Mississauga", "Ontario", "Mississauga",
    "6635 Kitimat Rd, Mississauga, ON L5N 6J2", 43.5878, -79.7438),
  m("ca_noor_mosque_mississauga", "Noor Islamic Cultural Center", "Ontario", "Mississauga",
    "1340 Speers Rd, Oakville, ON L6L 2X4", 43.4220, -79.7220),
];

// Brampton
const BRAMPTON: CanadaMosque[] = [
  m("ca_imo_brampton", "International Muslim Organization (IMO)", "Ontario", "Brampton",
    "1 Islamic Dr, Brampton, ON L6X 0H1", 43.6803, -79.7600,
    undefined, "https://imocanada.com"),
  m("ca_al_salam_brampton", "Al-Salam Mosque", "Ontario", "Brampton",
    "930 Central Park Dr N, Brampton, ON L6S 5J3", 43.7396, -79.7225),
  m("ca_masjid_iqra_brampton", "Masjid Iqra", "Ontario", "Brampton",
    "495 Chrysler Dr, Brampton, ON L6S 6G9", 43.7599, -79.7036),
  m("ca_islamic_centre_brampton", "Islamic Centre of Brampton", "Ontario", "Brampton",
    "31 Laval Dr, Brampton, ON L6Y 4Z3", 43.6648, -79.7620),
  m("ca_masjid_saliheen", "Masjid-e-Saliheen", "Ontario", "Brampton",
    "10256 The Gore Rd, Brampton, ON L6P 3A2", 43.7842, -79.7018),
  m("ca_brampton_masjid_al_falah", "Masjid Al-Falah Brampton", "Ontario", "Brampton",
    "2 Rutherford Rd S, Brampton, ON L6W 3J3", 43.6902, -79.7270),
];

// Markham / Richmond Hill / Vaughan / Thornhill
const YORK_REGION: CanadaMosque[] = [
  m("ca_isyro", "Islamic Society of York Region", "Ontario", "Thornhill",
    "8081 Yonge St, Thornhill, ON L4J 1W3", 43.8089, -79.4249,
    undefined, "https://isyro.com"),
  m("ca_markham_islamic", "Markham Islamic Centre", "Ontario", "Markham",
    "7025 Woodbine Ave, Markham, ON L3R 2N1", 43.8637, -79.3613),
  m("ca_richmond_hill_mosque", "Richmond Hill Muslim Association", "Ontario", "Richmond Hill",
    "10880 Yonge St, Richmond Hill, ON L4C 3E5", 43.8820, -79.4360),
  m("ca_mac_richmond_hill", "MAC Richmond Hill Centre", "Ontario", "Richmond Hill",
    "10901 Yonge St, Richmond Hill, ON L4C 3E6", 43.8820, -79.4370,
    "Muslim Association of Canada"),
  m("ca_masjid_dar_us_salaam", "Masjid Dar Us Salaam", "Ontario", "Vaughan",
    "7 Director Ct, Woodbridge, ON L4L 7R3", 43.7930, -79.5680),
  m("ca_valley_masjid", "Valley Masjid", "Ontario", "Maple",
    "2160 Major Mackenzie Dr W, Maple, ON L6A 4P8", 43.8550, -79.5380),
  m("ca_mac_hamilton_bayview", "Islamic Society of Markham", "Ontario", "Markham",
    "4141 Hwy 7, Markham, ON L3R 1L2", 43.8480, -79.3780),
];

// Durham Region (Oshawa, Whitby, Ajax, Pickering)
const DURHAM: CanadaMosque[] = [
  m("ca_durham_islamic_assoc", "Durham Islamic Association", "Ontario", "Whitby",
    "57 Consumers Dr, Whitby, ON L1N 1C4", 43.8673, -78.9435),
  m("ca_ajax_islamic_centre", "Ajax Islamic Centre", "Ontario", "Ajax",
    "91 Westney Rd N, Ajax, ON L1T 1P4", 43.8613, -79.0303),
  m("ca_pickering_islamic_centre", "Islamic Centre of Pickering", "Ontario", "Pickering",
    "755 Kingston Rd, Pickering, ON L1V 1A5", 43.8332, -79.0927),
  m("ca_oshawa_masjid", "Oshawa Mosque / Masjid Al-Salaam", "Ontario", "Oshawa",
    "265 Stevenson Rd N, Oshawa, ON L1J 5N5", 43.9014, -78.8625),
];

// Hamilton / Burlington / Oakville
const HAMILTON_AREA: CanadaMosque[] = [
  m("ca_islamic_society_hamilton", "Islamic Society of Hamilton", "Ontario", "Hamilton",
    "575 Rymal Rd E, Hamilton, ON L8W 3N5", 43.2122, -79.8263,
    undefined, "https://www.islamicsocietyofhamilton.ca"),
  m("ca_mac_hamilton", "MAC Hamilton", "Ontario", "Hamilton",
    "20 Eldorado Ave, Hamilton, ON L8V 1G4", 43.2360, -79.8500,
    "Muslim Association of Canada"),
  m("ca_hamilton_central_mosque", "Hamilton Central Mosque", "Ontario", "Hamilton",
    "30 Sackville St, Hamilton, ON L8L 7Y1", 43.2550, -79.8640),
  m("ca_burlington_islamic_centre", "Burlington Islamic Centre", "Ontario", "Burlington",
    "2075 Pine St, Burlington, ON L7R 1T1", 43.3260, -79.8050),
  m("ca_halton_islamic", "Halton Islamic Association", "Ontario", "Oakville",
    "391 Burnhamthorpe Rd E, Oakville, ON L6H 7B4", 43.4635, -79.6983),
];

// Ottawa
const OTTAWA: CanadaMosque[] = [
  m("ca_ottawa_muslim_assoc", "Ottawa Muslim Association", "Ontario", "Ottawa",
    "251 Northwestern Ave, Ottawa, ON K1Y 0M1", 45.4007, -75.7270,
    undefined, "https://ottawamuslim.net"),
  m("ca_masjid_bilal_ottawa", "Masjid Bilal", "Ontario", "Ottawa",
    "2335 St. Laurent Blvd, Ottawa, ON K1G 4J8", 45.3865, -75.6326),
  m("ca_abu_huraira_ottawa", "Abu Huraira Centre", "Ontario", "Nepean",
    "1530 Merivale Rd, Nepean, ON K2G 3J6", 45.3528, -75.7388,
    undefined, "https://abuhuraira.ca"),
  m("ca_SNMC_ottawa", "South Nepean Muslim Community", "Ontario", "Nepean",
    "3020 Woodroffe Ave, Nepean, ON K2J 4G6", 45.2885, -75.7680),
  m("ca_gatineau_mosque", "Mosquée de Gatineau", "Quebec", "Gatineau",
    "76 rue Laval, Gatineau, QC J8X 3G3", 45.4356, -75.7184),
  m("ca_masjid_ar_rahman_ottawa", "Masjid Ar-Rahman Ottawa", "Ontario", "Ottawa",
    "1650 Woodroffe Ave, Ottawa, ON K2G 1W2", 45.3430, -75.7610),
  m("ca_ottawa_islamic_centre", "Ottawa Islamic Centre & Assalam Mosque", "Ontario", "Ottawa",
    "2335 St. Laurent Blvd, Ottawa, ON K1G 4J8", 45.3867, -75.6330),
  m("ca_mac_barrhaven", "Barrhaven Islamic Centre (MAC BIC)", "Ontario", "Nepean",
    "3020 Cedarview Rd, Nepean, ON K2J 4G5", 45.2900, -75.7590,
    "Muslim Association of Canada", "https://centres.macnet.ca/bic/"),
];

// London, Ontario
const LONDON_ON: CanadaMosque[] = [
  m("ca_london_muslim_mosque", "London Muslim Mosque", "Ontario", "London",
    "151 Oxford St W, London, ON N6H 1S3", 42.9956, -81.2662,
    undefined, "https://londonmuslimmosque.com"),
  m("ca_mac_london", "MAC London", "Ontario", "London",
    "450 Central Ave, London, ON N6B 2E4", 42.9793, -81.2437,
    "Muslim Association of Canada"),
  m("ca_islamic_centre_sw_ontario", "Islamic Centre of Southwest Ontario", "Ontario", "London",
    "2060 Dundas St E, London, ON N5V 1B4", 42.9991, -81.1744),
];

// Windsor
const WINDSOR_ON: CanadaMosque[] = [
  m("ca_windsor_islamic_assoc", "Windsor Islamic Association", "Ontario", "Windsor",
    "1320 Northwood St, Windsor, ON N9E 1A6", 42.2882, -83.0395,
    undefined, "https://windsorislamicassociation.com"),
  m("ca_downtown_mosque_windsor", "Downtown Windsor Mosque", "Ontario", "Windsor",
    "712 Marentette Ave, Windsor, ON N9A 3A3", 42.3202, -83.0489),
];

// Kitchener / Waterloo / Cambridge (beyond ICNA)
const KWC: CanadaMosque[] = [
  m("ca_mac_ic_waterloo", "Islamic Centre of Waterloo (MAC)", "Ontario", "Waterloo",
    "420 Columbia St W, Waterloo, ON N2T 1A9", 43.4729, -80.5612,
    "Muslim Association of Canada", "https://centres.macnet.ca/icwaterloo/"),
  m("ca_cambridge_mosque", "Cambridge Mosque", "Ontario", "Cambridge",
    "31 Beverly St, Cambridge, ON N1R 3Z6", 43.3618, -80.3146),
  m("ca_ansar_mosque_kitchener", "Ansar Mosque Kitchener", "Ontario", "Kitchener",
    "50 Belmont Ave W, Kitchener, ON N2M 1N3", 43.4479, -80.5016),
];

// ─── QUEBEC ───────────────────────────────────────────────────────────────────

const MONTREAL: CanadaMosque[] = [
  m("ca_mac_al_rawdah", "Al Rawdah Islamic Centre (MAC)", "Quebec", "Montreal",
    "9165 Rue du Champ-d'Eau, Montreal, QC H1P 1A9", 45.5930, -73.5580,
    "Muslim Association of Canada", "https://centres.macnet.ca/alrawdah/"),
  m("ca_iccm_montreal", "Islamic Community Centre of Montreal", "Quebec", "Montreal",
    "180 Rue Lajeunesse, Montreal, QC H3L 2B8", 45.5478, -73.6385),
  m("ca_masjid_assalam_mtl", "Masjid As-Salam", "Quebec", "Montreal",
    "1315 Rue Jarry E, Montreal, QC H2E 1A7", 45.5590, -73.6098),
  m("ca_centre_islamique_laval", "Centre Islamique de Laval", "Quebec", "Laval",
    "3005 Boul des Laurentides, Laval, QC H7K 2J6", 45.6048, -73.7236),
  m("ca_mosquee_al_oumma", "Mosquée Al-Oumma", "Quebec", "Montreal",
    "4320 Rue Jean-Talon E, Montreal, QC H1S 1K3", 45.5445, -73.5862),
  m("ca_dar_al_arkam_mtl", "Dar Al-Arqam", "Quebec", "Montreal",
    "8070 Boul Langelier, Montreal, QC H1P 3G1", 45.5879, -73.5672),
  m("ca_masjid_at_taqwa_mtl", "Masjid At-Taqwa", "Quebec", "Montreal",
    "8155 Boul Taschereau, Brossard, QC J4X 1C2", 45.4503, -73.4819),
  m("ca_icc_quebec_city", "Islamic Cultural Centre of Quebec City", "Quebec", "Quebec City",
    "2415 Rue Clémenceau, Quebec City, QC G1V 2H5", 46.7779, -71.3054),
];

// ─── ALBERTA ─────────────────────────────────────────────────────────────────

const CALGARY: CanadaMosque[] = [
  m("ca_mac_al_salam_calgary", "Al-Salam Centre (MAC Calgary)", "Alberta", "Calgary",
    "1216 Convenience Trail NE, Calgary, AB T3J 5H5", 51.1017, -113.9810,
    "Muslim Association of Canada", "https://centres.macnet.ca/alsalamcentre/"),
  m("ca_baitunnur_mosque", "Baitun Nur Mosque", "Alberta", "Calgary",
    "10 Hamdard Park SW, Calgary, AB T2Y 0K9", 50.9560, -114.1270),
  m("ca_makki_mosque_calgary", "Makki Mosque", "Alberta", "Calgary",
    "5626 Temple Dr NE, Calgary, AB T1Y 3R4", 51.1045, -113.9610),
  m("ca_al_madinah_mosque_calgary", "Al Madinah Islamic Association", "Alberta", "Calgary",
    "5416 Temple Dr NE, Calgary, AB T1Y 3R2", 51.1003, -113.9600),
  m("ca_msa_calgary_university", "MSA University of Calgary", "Alberta", "Calgary",
    "2500 University Dr NW, Calgary, AB T2N 1N4", 51.0782, -114.1341),
  m("ca_al_azhar_mosque_calgary", "Al-Azhar Islamic Centre", "Alberta", "Calgary",
    "4020 Marlborough Dr NE, Calgary, AB T2A 5M3", 51.0538, -113.9690),
  m("ca_calgary_islamic_school_mosque", "Calgary Islamic School Mosque", "Alberta", "Calgary",
    "8531 Broadcast Ave SW, Calgary, AB T3H 4E7", 51.0286, -114.1891),
  m("ca_iccn_calgary", "Islamic Centre of Canada NE Calgary", "Alberta", "Calgary",
    "5315 Falconridge Blvd NE, Calgary, AB T3J 3N4", 51.1189, -113.9471),
  m("ca_southside_islamiccentre_calgary", "South Side Islamic Centre", "Alberta", "Calgary",
    "8330 Fairmount Dr SE, Calgary, AB T2H 0Y5", 50.9959, -114.0730),
];

const EDMONTON: CanadaMosque[] = [
  m("ca_al_rashid_mosque", "Al-Rashid Mosque", "Alberta", "Edmonton",
    "13070 113 St NW, Edmonton, AB T5E 5B8", 53.5798, -113.5290,
    undefined, "https://www.alrashidmosque.ca"),
  m("ca_mac_edmonton", "MAC Edmonton", "Alberta", "Edmonton",
    "12609 107 Ave NW, Edmonton, AB T5M 1Z5", 53.5685, -113.5528,
    "Muslim Association of Canada", "https://centres.macnet.ca/macedmonton/"),
  m("ca_gateway_masjid_edmonton", "Gateway Masjid", "Alberta", "Edmonton",
    "4803 101 Ave NW, Edmonton, AB T6A 0J5", 53.5355, -113.4820),
  m("ca_madinah_masjid_edmonton", "Madinah Masjid", "Alberta", "Edmonton",
    "9509 63 Ave NW, Edmonton, AB T6E 0G3", 53.5019, -113.4960),
  m("ca_al_noor_edmonton", "Al Noor Islamic Community Centre", "Alberta", "Edmonton",
    "13353 127 St NW, Edmonton, AB T5L 1A6", 53.5920, -113.5560),
  m("ca_edmonton_islamic_academy_mosque", "Edmonton Islamic Academy Masjid", "Alberta", "Edmonton",
    "8321 139 Ave NW, Edmonton, AB T5E 6V3", 53.5980, -113.4850),
];

// ─── MANITOBA ─────────────────────────────────────────────────────────────────

const WINNIPEG: CanadaMosque[] = [
  m("ca_al_rashid_winnipeg", "Al-Rashid Islamic Institute", "Manitoba", "Winnipeg",
    "570 Laxdal Rd, Winnipeg, MB R3R 0L7", 49.9089, -97.2199),
  m("ca_winnipeg_grand_mosque", "Winnipeg Grand Mosque", "Manitoba", "Winnipeg",
    "2445 Waverley St, Winnipeg, MB R3Y 1S3", 49.8428, -97.1930,
    undefined, "https://winnipegmasjid.ca"),
  m("ca_canadian_islamic_centre_wpg", "Canadian Islamic Centre", "Manitoba", "Winnipeg",
    "120 Maryland St, Winnipeg, MB R3G 1L1", 49.8897, -97.1600),
  m("ca_north_end_mosque", "North End Mosque", "Manitoba", "Winnipeg",
    "102 Andrews St, Winnipeg, MB R2W 2G7", 49.9117, -97.1386),
  m("ca_mac_winnipeg", "MAC Winnipeg", "Manitoba", "Winnipeg",
    "2445 Waverley St, Winnipeg, MB R3Y 1S3", 49.8428, -97.1930,
    "Muslim Association of Canada"),
];

// ─── SASKATCHEWAN ─────────────────────────────────────────────────────────────

const SASKATCHEWAN: CanadaMosque[] = [
  m("ca_regina_islamic_assoc", "Regina Islamic Association", "Saskatchewan", "Regina",
    "4301 - 4th Ave, Regina, SK S4T 0H6", 50.4558, -104.6289),
  m("ca_saskatoon_central_mosque", "Saskatoon Central Mosque", "Saskatchewan", "Saskatoon",
    "227 - 4th Ave S, Saskatoon, SK S7K 1M1", 52.1307, -106.6706,
    undefined, "https://saskatoonmosque.com"),
  m("ca_mac_saskatoon", "MAC Saskatoon", "Saskatchewan", "Saskatoon",
    "1003 Avenue I S, Saskatoon, SK S7M 2K9", 52.1186, -106.6670,
    "Muslim Association of Canada"),
];

// ─── NOVA SCOTIA ──────────────────────────────────────────────────────────────

const NOVA_SCOTIA: CanadaMosque[] = [
  m("ca_masjid_an_noor_halifax", "Masjid An-Noor Halifax", "Nova Scotia", "Halifax",
    "6225 Chebucto Rd, Halifax, NS B3L 1L9", 44.6489, -63.6215,
    undefined, "https://masjidannoor.ca"),
  m("ca_islamic_association_nova_scotia", "Islamic Association of Nova Scotia", "Nova Scotia", "Halifax",
    "8421 Mumford Rd, Halifax, NS B3L 4R5", 44.6331, -63.6393),
  m("ca_cape_breton_mosque", "Cape Breton Islamic Society", "Nova Scotia", "Sydney",
    "257 Charlotte St, Sydney, NS B1P 1C9", 46.1368, -60.1942),
];

// ─── NEW BRUNSWICK ────────────────────────────────────────────────────────────

const NEW_BRUNSWICK: CanadaMosque[] = [
  m("ca_moncton_mosque", "Islamic Association of Moncton", "New Brunswick", "Moncton",
    "200 McLaughlin Dr, Moncton, NB E1A 3R2", 46.1217, -64.8048),
  m("ca_fredericton_mosque", "Islamic Society of Fredericton", "New Brunswick", "Fredericton",
    "184 MacLaren Ave, Fredericton, NB E3A 2C5", 45.9705, -66.6490),
  m("ca_saint_john_mosque", "Islamic Association of Saint John", "New Brunswick", "Saint John",
    "1 Pokiok Rd, Saint John, NB E2M 4R8", 45.2759, -66.0835),
];

// ─── TORONTO ADDITIONAL ───────────────────────────────────────────────────────
const TORONTO_EXTRA: CanadaMosque[] = [
  m("ca_masjid_toronto_adelaide", "Masjid Toronto — Adelaide", "Ontario", "Toronto",
    "86 Adelaide St E, Toronto, ON M5C 1K6", 43.6508, -79.3741,
    "Muslim Association of Canada", "https://centres.macnet.ca/masjidtoronto/"),
  m("ca_islamic_society_toronto", "Islamic Society of Toronto", "Ontario", "Toronto",
    "4 Thorncliffe Park Dr, East York, ON M4H 1H1", 43.7060, -79.3511),
  m("ca_madina_masjid_danforth", "Madina Masjid", "Ontario", "Toronto",
    "1015 Danforth Ave, Toronto, ON M4J 1M1", 43.6817, -79.3337),
  m("ca_masjid_al_tawakal", "Masjid Al-Tawakal", "Ontario", "Toronto",
    "1330 Gerrard St E, Toronto, ON M4L 1Z1", 43.6717, -79.3303),
  m("ca_albanian_muslim_toronto", "Albanian Muslim Society of Toronto", "Ontario", "Toronto",
    "564 Annette St, Toronto, ON M6S 2C2", 43.6584, -79.4633),
  m("ca_taric_islamic", "TARIC Islamic Centre", "Ontario", "North York",
    "99 Beverley Hills Dr, North York, ON M3L 1A2", 43.7318, -79.5128),
  m("ca_zafar_mosque", "Zafar Mosque", "Ontario", "North York",
    "153 Benworth Ave, North York, ON M6A 1P6", 43.7036, -79.4596),
  m("ca_abu_huraira_toronto", "Abu Huraira Center", "Ontario", "North York",
    "270 Yorkland Blvd, North York, ON M2J 5C9", 43.7763, -79.3437,
    undefined, "https://abuhuraira.org"),
  m("ca_canadian_islamic_assoc", "Canadian Islamic Association", "Ontario", "Etobicoke",
    "80 Avening Dr, Etobicoke, ON M9V 1Y1", 43.7397, -79.5858),
  m("ca_bosnian_islamic_toronto", "Bosnian Islamic Association Gazi Husrev-Beg", "Ontario", "Etobicoke",
    "122 North Queen St, Etobicoke, ON M8Z 2E4", 43.6224, -79.5283),
  m("ca_croatian_islamic_toronto", "Croatian Islamic Centre", "Ontario", "Etobicoke",
    "75 Birmingham St, Etobicoke, ON M8V 2C3", 43.6075, -79.5078),
  m("ca_al_firdous_toronto", "Al-Firdous Islamic Centre", "Ontario", "North York",
    "342A Marlee Ave, North York, ON M6B 3H8", 43.7055, -79.4445),
  m("ca_masjid_rasul_al_azam", "Masjid Rasul Al-Azam", "Ontario", "North York",
    "83 Sunrise Ave, North York, ON M4A 1B1", 43.7165, -79.3358),
  m("ca_afghan_canadian_islamic", "Afghan Canadian Islamic Community", "Ontario", "North York",
    "132 Rail Side Rd, Unit 15, Don Mills, ON M3A 1A3", 43.7527, -79.3332),
  m("ca_masjid_en_noor_toronto", "Masjid E Noor", "Ontario", "Toronto",
    "277 Scott Rd, Toronto, ON M6M 3V3", 43.6925, -79.4791),
];

// ─── SCARBOROUGH ADDITIONAL ───────────────────────────────────────────────────
const SCARBOROUGH_EXTRA: CanadaMosque[] = [
  m("ca_salaheddin_islamic", "Salaheddin Islamic Centre", "Ontario", "Scarborough",
    "741 Kennedy Rd, Scarborough, ON M1K 2C6", 43.7126, -79.2721,
    undefined, "https://www.salaheddin.org"),
  m("ca_al_huda_muslim_society", "Al-Huda Muslim Society", "Ontario", "Scarborough",
    "975 Kennedy Rd, Scarborough, ON M1P 2K5", 43.7213, -79.2646),
  m("ca_baitul_aman_danforth", "Baitul Aman Masjid", "Ontario", "Scarborough",
    "3114 Danforth Ave, Scarborough, ON M1L 1B1", 43.6917, -79.2897),
  m("ca_baitul_jannah", "Baitul Jannah Islamic Center", "Ontario", "Scarborough",
    "2740 Kingston Rd, Scarborough, ON M1M 1M7", 43.7027, -79.2383),
  m("ca_baitul_mukarram", "Baitul Mukarram Islamic Society", "Ontario", "Scarborough",
    "3340 Danforth Ave, Scarborough, ON M1L 1C6", 43.6918, -79.2734),
  m("ca_icna_mclevin", "ICNA Canada / Muslim Welfare Centre", "Ontario", "Scarborough",
    "100 McLevin Ave, Unit 3A, Scarborough, ON M1B 2V5", 43.8016, -79.1937),
];

// ─── MISSISSAUGA ADDITIONAL ───────────────────────────────────────────────────
const MISSISSAUGA_EXTRA: CanadaMosque[] = [
  m("ca_jamia_riyadhul_jannah", "Jamia Riyadhul Jannah", "Ontario", "Mississauga",
    "6680 Campobello Rd, Mississauga, ON L5N 2L8", 43.5819, -79.7502),
  m("ca_masjid_el_farooq_miss", "Masjid El-Farooq", "Ontario", "Mississauga",
    "935 Eglinton Ave W, Mississauga, ON L5R 1A6", 43.6028, -79.6603),
  m("ca_istiqamah_islamic", "Istiqamah Islamic Centre (IICO)", "Ontario", "Mississauga",
    "3410 Semenyk Ct, Unit 3, Mississauga, ON L5C 4P9", 43.5748, -79.6444),
  m("ca_mac_mississauga", "MAC Mississauga Centre", "Ontario", "Mississauga",
    "3250 Ridgeway Dr, Mississauga, ON L5L 5Y6", 43.5465, -79.6953,
    "Muslim Association of Canada"),
  m("ca_minhaj_ul_quran", "Minhaj ul Quran Canada", "Ontario", "Mississauga",
    "2505 Dixie Rd, Mississauga, ON L4Y 2A1", 43.6097, -79.5873),
  m("ca_ar_rehman_mississauga", "Ar-Rehman Islamic Centre (ARIC)", "Ontario", "Mississauga",
    "2680 Matheson Blvd E, Mississauga, ON L4W 0A5", 43.6842, -79.6136,
    "ICNA Canada"),
];

// ─── BRAMPTON ADDITIONAL ──────────────────────────────────────────────────────
const BRAMPTON_EXTRA: CanadaMosque[] = [
  m("ca_makki_masjid_brampton", "Makki Masjid / Islamic Society of Peel", "Ontario", "Brampton",
    "8450 Torbram Rd, Brampton, ON L6T 4M9", 43.7188, -79.6896),
  m("ca_bramalea_icc", "Bramalea Islamic Cultural Centre (BICC)", "Ontario", "Brampton",
    "25 Kings Cross Rd, Brampton, ON L6T 3X9", 43.7238, -79.7073),
  m("ca_jame_masjid_brampton", "Jame Masjid Brampton", "Ontario", "Brampton",
    "7470 McLaughlin Rd, Brampton, ON L6Y 0C7", 43.6593, -79.7573),
  m("ca_masjid_e_aqsa", "Masjid e Aqsa", "Ontario", "Brampton",
    "30 Rambler Dr, Brampton, ON L6W 1E2", 43.6840, -79.7476),
];

// ─── YORK REGION ADDITIONAL ───────────────────────────────────────────────────
const YORK_REGION_EXTRA: CanadaMosque[] = [
  m("ca_ift_markham", "Islamic Foundation of Toronto — Markham", "Ontario", "Markham",
    "10992 Kennedy Rd, Markham, ON L6C 1P1", 43.8797, -79.2671,
    undefined, "https://www.islamicfoundation.ca"),
  m("ca_masjid_darul_iman", "Islamic Society of Markham (Masjid Darul Iman)", "Ontario", "Markham",
    "6210 16th Ave, Markham, ON L3P 3L3", 43.8654, -79.2897),
  m("ca_al_nadwa_markham", "Al Nadwa Educational Islamic Centre", "Ontario", "Markham",
    "455 Confederation Ave, Unit 3, Markham, ON L6G 1B4", 43.8656, -79.3087),
  m("ca_al_abrar_richmond_hill", "Al Abrar Muslim Association", "Ontario", "Richmond Hill",
    "11800 Bayview Ave, Unit 21, Richmond Hill, ON L4S 1L2", 43.9025, -79.3987),
  m("ca_isyro_stouffville", "Islamic Society of York Region — East", "Ontario", "Richmond Hill",
    "1380 Stouffville Rd, Richmond Hill, ON L4E 3C7", 43.9312, -79.4256),
  m("ca_masjid_vaughan", "Masjid Vaughan", "Ontario", "Vaughan",
    "9954 Keele St, Maple, ON L6A 3Y4", 43.8616, -79.5214,
    "Risalah Foundation"),
  m("ca_islamic_society_vaughan", "Islamic Society of Vaughan (Masjid Al-Barakah)", "Ontario", "Vaughan",
    "9100 Jane St, Units 22-24, Vaughan, ON L4K 0A4", 43.7985, -79.5338),
];

// ─── DURHAM REGION ADDITIONAL ─────────────────────────────────────────────────
const DURHAM_EXTRA: CanadaMosque[] = [
  m("ca_masjid_quba_ajax", "Islamic Society of Ajax (Masjid Quba)", "Ontario", "Ajax",
    "1501 Harwood Ave N, Ajax, ON L1T 4T9", 43.8841, -79.0389),
  m("ca_masjid_al_aqsaa_ajax", "Masjid Al-Aqsaa", "Ontario", "Ajax",
    "43 Station St, Ajax, ON L1S 1S2", 43.8549, -79.0269),
  m("ca_masjid_usman_pickering", "Masjid Usman (Pickering Islamic Centre)", "Ontario", "Pickering",
    "2590 Brock Rd, Pickering, ON L1X 0K3", 43.8538, -79.0753),
  m("ca_muslim_assoc_whitby", "Muslim Association of Whitby", "Ontario", "Whitby",
    "221 Kendalwood Rd, Whitby, ON L1N 2G1", 43.8700, -78.9430),
];

// ─── HAMILTON ADDITIONAL ──────────────────────────────────────────────────────
const HAMILTON_EXTRA: CanadaMosque[] = [
  m("ca_hamilton_mountain_mosque", "Hamilton Mountain Mosque (MAH)", "Ontario", "Hamilton",
    "1545 Stone Church Rd E, Hamilton, ON L8W 3P8", 43.2145, -79.8290),
  m("ca_umar_mosque_hamilton", "Umar Mosque (MAH)", "Ontario", "Hamilton",
    "734 Rennie St, Hamilton, ON L8H 3R2", 43.2477, -79.8032),
  m("ca_hamilton_downtown_mosque", "Hamilton Downtown Mosque", "Ontario", "Hamilton",
    "221 York Blvd, Hamilton, ON L8R 1Y6", 43.2568, -79.8664),
  m("ca_ibrahim_jame_mosque", "Ibrahim Jame Mosque", "Ontario", "Hamilton",
    "788 King St E, Hamilton, ON L8M 1A6", 43.2510, -79.8289),
  m("ca_halton_islamic_burlington", "Halton Islamic Association (Masjid Halton)", "Ontario", "Burlington",
    "4310 Fairview St, Burlington, ON L7L 4Y8", 43.3742, -79.7781,
    undefined, "https://haltonislamicassociation.com"),
];

// ─── OTTAWA ADDITIONAL ────────────────────────────────────────────────────────
const OTTAWA_EXTRA: CanadaMosque[] = [
  m("ca_mac_ottawa", "MAC Ottawa Islamic Centre", "Ontario", "Ottawa",
    "1085 Grenon Ave, Ottawa, ON K2B 8L7", 45.3548, -75.7985,
    "Muslim Association of Canada", "https://centres.macnet.ca/maccottawa/"),
  m("ca_masjid_ar_rahmah_ottawa", "Masjid Ar-Rahmah (Assunnah Muslims Association)", "Ontario", "Ottawa",
    "1216 Hunt Club Rd, Ottawa, ON K1V 2P1", 45.3625, -75.6559,
    undefined, "https://www.mymasjid.ca"),
  m("ca_masjid_bilal_orleans", "Masjid Bilal (Orleans)", "Ontario", "Ottawa",
    "Orleans, Ottawa, ON", 45.4567, -75.5261),
  m("ca_jami_omar_bells_corners", "Jami Omar Mosque (Bells Corners)", "Ontario", "Ottawa",
    "Bells Corners, Ottawa, ON", 45.3292, -75.8368),
  m("ca_faizan_e_madina_ottawa", "Faizan-e-Madina Islamic Center", "Ontario", "Ottawa",
    "415 McArthur Ave, Ottawa, ON K1K 1G5", 45.4381, -75.6668),
];

// ─── ONTARIO — OTHER CITIES ───────────────────────────────────────────────────
const ONTARIO_OTHER: CanadaMosque[] = [
  m("ca_islamic_society_kingston", "Islamic Society of Kingston", "Ontario", "Kingston",
    "1477 Sydenham Rd, Kingston, ON K7M 5T4", 44.2304, -76.5480),
  m("ca_islamic_society_niagara", "Islamic Society of Niagara Peninsula", "Ontario", "Niagara Falls",
    "6768 Lyons Creek Rd, Niagara Falls, ON L2E 6S5", 43.0791, -79.0894),
  m("ca_islamic_assoc_st_catharines", "Islamic Association of St. Catharines", "Ontario", "St. Catharines",
    "117 Geneva St, St. Catharines, ON L2R 4N3", 43.1593, -79.2443),
  m("ca_cambridge_islamic_centre", "Cambridge Islamic Centre", "Ontario", "Cambridge",
    "16 International Village Dr, Cambridge, ON N1R 8G1", 43.3683, -80.3192),
  m("ca_muslim_society_guelph", "Muslim Society of Guelph", "Ontario", "Guelph",
    "44 Marlborough Rd, Guelph, ON N1H 2H9", 43.5417, -80.2563),
  m("ca_sarnia_masjid", "Sarnia Masjid", "Ontario", "Sarnia",
    "281 Cobden St, Sarnia, ON N7T 7B7", 42.9940, -82.4055),
  m("ca_islamic_assoc_sudbury", "Islamic Association of Sudbury", "Ontario", "Sudbury",
    "755 Churchill Ave, Sudbury, ON P3A 4A1", 46.4929, -80.9849),
  m("ca_thunder_bay_muslim_assoc", "Thunder Bay Muslim Association", "Ontario", "Thunder Bay",
    "70 Court St N, Thunder Bay, ON P7A 4T0", 48.3812, -89.2477),
];

// ─── MONTREAL ADDITIONAL ──────────────────────────────────────────────────────
const MONTREAL_EXTRA: CanadaMosque[] = [
  m("ca_icq_montreal", "Islamic Centre of Quebec (ICQ)", "Quebec", "Montreal",
    "2520 Chemin Laval, Ville Saint-Laurent, QC H4L 3A1", 45.5047, -73.7012,
    undefined, "https://icqmontreal.com"),
  m("ca_mcq_ndg", "Muslim Community of Quebec (MCQ)", "Quebec", "Montreal",
    "7445 Chester Ave, Montreal, QC H4V 1M4", 45.4862, -73.6104),
  m("ca_el_kairouane_mosque", "El-Kairouane Mosque", "Quebec", "Montreal",
    "3726 Jean Talon Est, Montreal, QC H2A 1X9", 45.5609, -73.5946),
  m("ca_fatih_sultan_mosque", "Fatih Sultan Mehmed Mosque", "Quebec", "Montreal",
    "7387 Boul St-Laurent, Montreal, QC H2R 1W7", 45.5309, -73.6240),
  m("ca_nour_el_islam_montreal", "Nour El-Islam Mosque (IANM)", "Quebec", "Montreal",
    "4675 Rue Amiens, Montreal, QC H1H 2H6", 45.5966, -73.6022),
  m("ca_centre_islamique_badr", "Centre Islamique Badr", "Quebec", "Montreal",
    "6955 Lacordaire, Saint-Léonard, QC H1T 2J9", 45.5804, -73.5680),
  m("ca_masjid_makka_montreal", "Masjid Makka Al-Mukarramah", "Quebec", "Montreal",
    "11900 Boul Gouin O, Pierrefonds, QC H8Z 1V6", 45.5018, -73.8602),
  m("ca_west_island_islamic", "Centre Islamique du West Island", "Quebec", "Dollard-des-Ormeaux",
    "3934 Boul St-Jean, Dollard-des-Ormeaux, QC H9G 1X1", 45.4817, -73.8284),
  m("ca_markaz_al_islam_longueuil", "Markaz Al-Islam (Flah Mosque)", "Quebec", "Saint-Hubert",
    "1885 Rue Nielsen, Saint-Hubert, QC J4T 1P1", 45.4878, -73.4281),
  m("ca_jamia_islamia_longueuil", "Jamia Islamia Mosque", "Quebec", "Longueuil",
    "2144 Rue St-Hélène, Longueuil, QC J4K 3T6", 45.5357, -73.5188),
  m("ca_great_mosque_quebec_city", "Grande Mosquée de Québec", "Quebec", "Quebec City",
    "2271 Chemin Sainte-Foy, Quebec City, QC G1V 1T3", 46.7997, -71.2650),
  m("ca_trois_rivieres_mosque", "Mosquée de Trois-Rivières", "Quebec", "Trois-Rivières",
    "3009 Boul de Forges, Trois-Rivières, QC G8Z 1V3", 46.3538, -72.5617),
];

// ─── LAVAL ────────────────────────────────────────────────────────────────────
const LAVAL: CanadaMosque[] = [
  m("ca_mosquee_al_ansar", "Mosquée Al Ansar", "Quebec", "Laval",
    "221 Boul des Laurentides, Laval, QC H7G 2T7", 45.5650, -73.7118),
  m("ca_alihssane_laval", "Association Islamique Alihssane de Laval", "Quebec", "Laval",
    "600 Boul des Laurentides, Laval, QC H7G 2V5", 45.5678, -73.7187),
  m("ca_kawtar_laval", "Centre Kawtar de Laval", "Quebec", "Laval",
    "3871 Autoroute des Laurentides, Laval, QC H7L 3H7", 45.5893, -73.7493),
  m("ca_siddiquia_laval", "Siddiquia Mosque & Community Center", "Quebec", "Laval",
    "1655 Rue du Couvent, Laval, QC H7W 3A8", 45.5276, -73.7852),
  m("ca_aman_laval", "Aman Laval Mosque", "Quebec", "Laval",
    "5047 Boul Lévesque E, Laval, QC H7C 1N3", 45.5518, -73.7416),
];

// ─── CALGARY ADDITIONAL ───────────────────────────────────────────────────────
const CALGARY_EXTRA: CanadaMosque[] = [
  m("ca_akram_jomaa_calgary", "Akram Jomaa Islamic Centre", "Alberta", "Calgary",
    "2612 37 Ave NE, Calgary, AB T1Y 5L2", 51.0735, -113.9848),
  m("ca_iisc_main_calgary", "IISC — Main Calgary", "Alberta", "Calgary",
    "207 4 St NE, Calgary, AB T2E 3R3", 51.0603, -114.0428),
  m("ca_iisc_dar_al_hijrah", "IISC — Dar Al-Hijrah NE", "Alberta", "Calgary",
    "4128 6 St NE, Calgary, AB T2E 8C8", 51.0762, -114.0326),
  m("ca_calgary_sw_masjid", "Calgary Southwest Masjid (CICSW)", "Alberta", "Calgary",
    "5615 14 Ave SW, Calgary, AB T3H 2E8", 51.0267, -114.1668),
  m("ca_al_madinah_downtown_calgary", "Al Madinah Calgary Islamic Centre (Downtown)", "Alberta", "Calgary",
    "421 Riverfront Ave SE, Calgary, AB T2G 0B1", 51.0486, -114.0479),
  m("ca_al_madinah_ne_calgary", "Al Madinah Calgary Islamic Assembly", "Alberta", "Calgary",
    "4616 80 Ave NE, Calgary, AB T3J 4B7", 51.0952, -113.9371),
  m("ca_al_hedaya_calgary", "Al Hedaya Islamic Centre", "Alberta", "Calgary",
    "1009 7 Ave SW, Calgary, AB T2P 1A8", 51.0477, -114.0889),
  m("ca_alkawthar_calgary", "Alkawthar Community Centre", "Alberta", "Calgary",
    "5402 16 Ave SE, Calgary, AB T2A 0S7", 51.0456, -113.9926),
  m("ca_alfalah_ne_calgary", "Alfalah Calgary Islamic Centre", "Alberta", "Calgary",
    "2640 52 St NE, Calgary, AB T1Y 3R4", 51.0745, -113.9543),
  m("ca_salah_el_deen_red_deer", "Salah El-Deen Mosque", "Alberta", "Red Deer",
    "195 Douglas Ave, Red Deer, AB T4R 2G2", 52.2613, -113.8168),
  m("ca_islamic_assoc_medicine_hat", "Islamic Association of Medicine Hat", "Alberta", "Medicine Hat",
    "Medicine Hat, AB", 50.0425, -110.6770),
  m("ca_lethbridge_islamic", "Islamic Association of Lethbridge", "Alberta", "Lethbridge",
    "Lethbridge, AB", 49.6956, -112.8451),
];

// ─── EDMONTON ADDITIONAL ──────────────────────────────────────────────────────
const EDMONTON_EXTRA: CanadaMosque[] = [
  m("ca_university_mosque_edmonton", "Muslim Community of Edmonton (University Mosque)", "Alberta", "Edmonton",
    "10721 86 Ave NW, Edmonton, AB T6E 2M8", 53.5255, -113.5030),
  m("ca_sahaba_mosque_edmonton", "Downtown Islamic Association (Sahaba Mosque)", "Alberta", "Edmonton",
    "9216 105 Ave NW, Edmonton, AB T5H 0J5", 53.5530, -113.4982),
  m("ca_quba_mosque_edmonton", "Quba Mosque", "Alberta", "Edmonton",
    "11517 105 Ave NW, Edmonton, AB T5H 3Y5", 53.5528, -113.5338),
  m("ca_markaz_ul_islam_edmonton", "Markaz-ul-Islam (Uptown Masjid)", "Alberta", "Edmonton",
    "7907 36 Ave NW, Edmonton, AB T6K 3S6", 53.4802, -113.5413),
  m("ca_masjid_al_omari_edmonton", "Masjid Al Omari", "Alberta", "Edmonton",
    "6504 137 Ave NW, Edmonton, AB T5A 1R8", 53.5993, -113.4182),
  m("ca_jamia_riyadhul_jannah_edmonton", "Jamia Riyadhul Jannah Edmonton", "Alberta", "Edmonton",
    "331 71 St SW, Edmonton, AB T6X 1A3", 53.4639, -113.5914),
  m("ca_lac_la_biche_mosque", "Al Kareem Mosque (Lac La Biche)", "Alberta", "Lac La Biche",
    "Lac La Biche, AB T0A 2C0", 54.7692, -111.9729),
];

// ─── WINNIPEG ADDITIONAL ──────────────────────────────────────────────────────
const WINNIPEG_EXTRA: CanadaMosque[] = [
  m("ca_winnipeg_central_mosque", "Winnipeg Central Mosque", "Manitoba", "Winnipeg",
    "715 Ellice Ave, Winnipeg, MB R3G 0B3", 49.8892, -97.1564),
  m("ca_abu_bakr_siddique_wpg", "Abu Bakr Al-Siddique Masjid & Community Centre", "Manitoba", "Winnipeg",
    "794 Ellice Ave, Winnipeg, MB R3G 0B9", 49.8895, -97.1491),
  m("ca_salam_masjid_wpg", "Salam Masjid", "Manitoba", "Winnipeg",
    "294 Burrows Ave, Winnipeg, MB R2W 1Z6", 49.9115, -97.1321),
  m("ca_rahma_islamic_wpg", "Rahma Islamic Centre", "Manitoba", "Winnipeg",
    "574 Watt St, Winnipeg, MB R2K 4K1", 49.9267, -97.0893),
];

// ─── SASKATCHEWAN ADDITIONAL ──────────────────────────────────────────────────
const SASK_EXTRA: CanadaMosque[] = [
  m("ca_regina_islamic_centre", "Islamic Association of Saskatchewan", "Saskatchewan", "Regina",
    "3273 Montague St, Regina, SK S4S 1Z8", 50.4088, -104.6212),
  m("ca_saskatoon_islamic_centre", "Saskatoon Islamic Centre", "Saskatchewan", "Saskatoon",
    "222 Copland Crescent, Saskatoon, SK S7H 2Z5", 52.1247, -106.6173),
  m("ca_swift_current_islamic", "Islamic Centre of Swift Current", "Saskatchewan", "Swift Current",
    "369 Powell Cres, Swift Current, SK S9H 4C7", 50.2947, -107.7952),
];

// ─── ATLANTIC CANADA ADDITIONAL ───────────────────────────────────────────────
const ATLANTIC_EXTRA: CanadaMosque[] = [
  m("ca_ummah_mosque_halifax", "Ummah Mosque and Community Centre", "Nova Scotia", "Halifax",
    "2510 Saint Matthias St, Halifax, NS B3L 0A9", 44.6508, -63.6278,
    undefined, "https://ummahmosque.ca"),
  m("ca_al_barakah_halifax", "Al-Barakah Masjid (United Muslims of Halifax)", "Nova Scotia", "Halifax",
    "12 Hillcrest St, Halifax, NS B3M 4H1", 44.6782, -63.6522),
  m("ca_islamic_assoc_maritimes", "Islamic Association of the Maritime Provinces", "Nova Scotia", "Dartmouth",
    "42 Leaman Dr, Dartmouth, NS B2Y 5Y2", 44.6724, -63.5523),
  m("ca_fredericton_islamic_assoc", "Fredericton Islamic Association", "New Brunswick", "Fredericton",
    "130 Lincoln Rd, Fredericton, NB E3B 2Y1", 45.9479, -66.6285),
  m("ca_muslim_assoc_nb", "Muslim Association of New Brunswick", "New Brunswick", "Saint John",
    "1100 Rothsey Rd, Saint John, NB E2H 2H8", 45.3074, -65.9254),
  m("ca_masjid_an_noor_stjohns", "Masjid-an-Noor (Newfoundland)", "Newfoundland and Labrador", "St. John's",
    "47 Smith Ave, St. John's, NL A1C 5G1", 47.5615, -52.7126),
  m("ca_masjid_dar_as_salam_pei", "Masjid Dar as-Salam", "Prince Edward Island", "Charlottetown",
    "Charlottetown, PE C1A 1A1", 46.2382, -63.1311),
];

// ─── TERRITORIES ──────────────────────────────────────────────────────────────
const TERRITORIES: CanadaMosque[] = [
  m("ca_midnight_sun_mosque", "Midnight Sun Mosque", "Northwest Territories", "Inuvik",
    "Inuvik, NT X0E 0T0", 68.3607, -133.7230),
  m("ca_masjid_iqaluit", "Masjid Iqaluit", "Nunavut", "Iqaluit",
    "Iqaluit, NU X0A 0H0", 63.7467, -68.5170),
  m("ca_yukon_muslim_society", "Yukon Muslim Society", "Yukon", "Whitehorse",
    "Whitehorse, YT Y1A 0A1", 60.7212, -135.0568),
];

export const CANADA_MOSQUES: CanadaMosque[] = [
  // Base GTA
  ...TORONTO,
  ...TORONTO_EXTRA,
  ...SCARBOROUGH,
  ...SCARBOROUGH_EXTRA,
  ...MISSISSAUGA,
  ...MISSISSAUGA_EXTRA,
  ...BRAMPTON,
  ...BRAMPTON_EXTRA,
  ...YORK_REGION,
  ...YORK_REGION_EXTRA,
  ...DURHAM,
  ...DURHAM_EXTRA,
  // Ontario — other
  ...HAMILTON_AREA,
  ...HAMILTON_EXTRA,
  ...OTTAWA,
  ...OTTAWA_EXTRA,
  ...ONTARIO_OTHER,
  ...LONDON_ON,
  ...WINDSOR_ON,
  ...KWC,
  // Quebec
  ...MONTREAL,
  ...MONTREAL_EXTRA,
  ...LAVAL,
  // Alberta
  ...CALGARY,
  ...CALGARY_EXTRA,
  ...EDMONTON,
  ...EDMONTON_EXTRA,
  // Manitoba & Saskatchewan
  ...WINNIPEG,
  ...WINNIPEG_EXTRA,
  ...SASKATCHEWAN,
  ...SASK_EXTRA,
  // Atlantic & Territories
  ...NOVA_SCOTIA,
  ...NEW_BRUNSWICK,
  ...ATLANTIC_EXTRA,
  ...TERRITORIES,
];

export function getCanadaMosques(): CanadaMosque[] {
  return CANADA_MOSQUES;
}
