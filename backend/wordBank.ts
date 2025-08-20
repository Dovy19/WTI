// backend/wordBank.ts
export interface WordPair {
  word: string;
  category: string;
}

export const WORD_BANK: WordPair[] = [
  // Famous People
 { word: "Aatrox", category: "Frontline" },                      // positioning
  { word: "Ahri", category: "AP" },                              // damage type
  { word: "Akali", category: "Frontline" },                        // archetype (supreme cells executioner—bruiser style)
  { word: "Ashe", category: "Recommended Item: Guinsoos Rageblade" }, // item
  { word: "Braum", category: "Cost ≥ 3" },                       // cost tier
  { word: "Caitlyn", category: "Backline access" },                     // positioning
  { word: "Darius", category: "AD" },                            // damage type
  { word: "Ekko", category: "Support" },                         // archetype (Prodigy, Strategist—supporty)
  { word: "Ezreal", category: "Recommended Item: Spear of Shojin" }, // item
  { word: "Garen", category: "Cost ≤ 3" },                       // cost tier
  { word: "Gwen", category: "AP" },                              // damage type
  { word: "Janna", category: "Support" },                        // archetype
  { word: "Jarvan", category: "Frontline" },                     // positioning
  { word: "Jhin", category: "Recommended Item: Infinity Edge" }, // item
  { word: "KSante", category: "Cost ≥ 3" },                      // cost tier
  { word: "Katarina", category: "Backline" },                    // positioning
  { word: "Kayle", category: "AP" },                             // damage type
  { word: "Kennen", category: "Bruiser" },                       // archetype (protector, sorcerer—tank/support)
  { word: "Lux", category: "Recommended Item: Jeweled Gauntlet" },  // item
  { word: "Malphite", category: "Cost ≤ 3" },                    // cost tier
  { word: "Malzahar", category: "AP" },                          // damage type
  { word: "Neeko", category: "Frontline" },                      // positioning
  { word: "Poppy", category: "Bruiser" },                        // archetype
  { word: "Rakan", category: "Support" },                        // archetype
  { word: "Rell", category: "Backline" },                        // positioning
  { word: "Ryze", category: "Recommended Item: Rabadons Deathcap" }, // item
  { word: "Samira", category: "AD" },                            // damage type
  { word: "Senna", category: "Cost ≥ 3" },                       // cost tier
  { word: "Seraphine", category: "AP" },                         // damage type
  { word: "Shen", category: "Frontline" },                       // positioning
  { word: "Sivir", category: "AD" },                        // archetype (sniper, but sturdy early)
  { word: "Swain", category: "Recommended Item: Gargoyle" },// item
  { word: "Syndra", category: "Recommended Item: Archangel" },                            // damage type
  { word: "Twisted Fate", category: "Backline" },                // positioning
  { word: "Udyr", category: "Bruiser" },                         // archetype
  { word: "Varus", category: "Recommended Item: Last Whisper" }, // item
  { word: "Vi", category: "Cost ≤ 3" },                          // cost tier
  { word: "Viego", category: "AD" },                             // damage type
  { word: "Volibear", category: "Frontline" },                   // positioning
  { word: "Xayah", category: "Recommended Item: Krakens Fury" },// item
  { word: "Xin Zhao", category: "Tank" },                     // archetype
  { word: "Yasuo", category: "Backline access" },                       // positioning
  { word: "Yone", category: "Bruiser" },                              // damage type

  // TFT Set 15 Items
  // { word: "Guinsoos Rageblade", category: "Set 15 Item" },
  // { word: "Gargoyle Stoneplate", category: "Set 15 Item" },
  // { word: "Infinity Edge", category: "Set 15 Item" },
  // { word: "Strikers Flail", category: "Set 15 Item" },
  // { word: "Spear of Shojin", category: "Set 15 Item" },
  // { word: "Warmogs Armor", category: "Set 15 Item" },
  // { word: "Edge of Night", category: "Set 15 Item" },
  // { word: "Sunfire Cape", category: "Set 15 Item" },
  // { word: "Spirit Visage", category: "Set 15 Item" },
  // { word: "Jeweled Gauntlet", category: "Set 15 Item" },
  // { word: "Thiefs Gloves", category: "Set 15 Item" },
  // { word: "Void Staff", category: "Set 15 Item" },
  // { word: "Evenshroud", category: "Set 15 Item" },
  // { word: "Archangels Staff", category: "Set 15 Item" },
  // { word: "Protectors Vow", category: "Set 15 Item" },
  // { word: "Dragons Claw", category: "Set 15 Item" },
  // { word: "Red Buff", category: "Set 15 Item" },
  // { word: "Adaptive Helm", category: "Set 15 Item" },
  // { word: "Hextech Gunblade", category: "Set 15 Item" },
  // { word: "Bramble Vest", category: "Set 15 Item" },
  // { word: "Bloodthirster", category: "Set 15 Item" },
  // { word: "Morellonomicon", category: "Set 15 Item" },
  // { word: "Hand Of Justice", category: "Set 15 Item" },
  // { word: "Giant Slayer", category: "Set 15 Item" },
  // { word: "Steadfast Heart", category: "Set 15 Item" },
  // { word: "Krakens Fury", category: "Set 15 Item" },
  // { word: "Steraks Gage", category: "Set 15 Item" },
  // { word: "Titans Resolve", category: "Set 15 Item" },
  // { word: "Last Whisper", category: "Set 15 Item" },
  // { word: "Ionic Spark", category: "Set 15 Item" },
  // { word: "Crownguard", category: "Set 15 Item" },
  // { word: "Deathblade", category: "Set 15 Item" },
  // { word: "Rabadons Deathcap", category: "Set 15 Item" },
  // { word: "Blue Buff", category: "Set 15 Item" },
  // { word: "Quicksilver", category: "Set 15 Item" },
  // { word: "Nashors Tooth", category: "Set 15 Item" },
];

export function getRandomWord(): WordPair {
  return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
}