type Domain = "fury" | "calm" | "mind" | "body" | "order" | "chaos";
type CardSlot = { cardId: string; quantity: number };
export type CardType = 'legend' | 'champion' | 'unit' | 'spell' | 'gear' | 'rune' | 'battlefield';

type Deck = {
  id: string;
  name: string;
  domains: Domain[]; // 1–2, dictated by the Legend's identity
  favorited: boolean;
  createdBy: string;
  lastUpdated: string; // ISO timestamp

  // Fixed zones — these CANNOT be sideboarded between games
  legend: string; // cardId of the Champion Legend
  runeDeck: CardSlot[]; // exactly 12
  battlefields: string[]; // exactly 3 unique cardIds

  // Swappable zone
  mainBoard: CardSlot[]; // exactly 40, includes the Chosen Champion
  chosenChampionId: string; // pointer to which mainBoard card sits in the champion zone
  sideBoard: CardSlot[]; // exactly 0 or 8
  sideBoardPlans: SideBoardPlan[]; // your per-hero sideboard guides
};


export type Card = {
  id: string; name: string; type: CardType; domain: Domain | null;
  cost: number | null; might: number | null; rarity: string | null;
  keywords: string[]; thumbnailUrl: string;
  quantity: number;
};
export type SideBoardPlan = {
  id: string;
  vs: string; // "Draven Aggro" — who you're siding against
  out: CardSlot[]; // pulled FROM mainBoard
  in: CardSlot[]; // pulled FROM sideBoard
  swapChampionTo?: string; // optional Chosen Champion swap (legal when sideboarding)
  notes?: string;
};




// ----- Catalog -----
const HEX: Record<string, string> = { fury:'b3261e', calm:'2e7d32', mind:'1565c0', body:'ef6c00', order:'546e7a', chaos:'6750a4' };
const thumb = (n: string, d: Domain | null) =>
  `https://placehold.co/120x168/${HEX[d ?? ''] ?? '3a3a3a'}/ffffff?text=${encodeURIComponent(n)}`;
const c = (id: string, name: string, type: CardType, domain: Domain | null, cost: number | null, might: number | null, rarity = 'Common', keywords: string[] = []): Card =>
  ({ id, name, type, domain, cost, might, rarity, keywords, thumbnailUrl: thumb(name, domain) });

export const cards: Card[] = [
  c('vi-legend', 'Vi, Piltover Enforcer', 'legend', null, null, null, 'Legendary'),
  c('vi-champ', 'Vi, Cybernetic', 'champion', 'fury', 5, 6, 'Epic', ['Tackle']),
  c('shock-trooper', 'Shock Trooper', 'unit', 'fury', 3, 4),
  c('brawler', 'Back-Alley Brawler', 'unit', 'fury', 2, 3),
  c('street-tough', 'Street Tough', 'unit', 'fury', 1, 2),
  c('reckless-charge', 'Reckless Charge', 'spell', 'chaos', 1, null),
  c('demolish', 'Demolish', 'spell', 'fury', 3, null),
  c('riot-instigator', 'Riot Instigator', 'unit', 'chaos', 4, 5, 'Rare'),
  c('chaos-bolt', 'Chaos Bolt', 'spell', 'chaos', 2, null),
  c('enforcer-squad', 'Enforcer Squad', 'unit', 'fury', 3, 3),
  c('overdrive', 'Overdrive', 'gear', 'fury', 2, null),
  c('wrecking-ball', 'Wrecking Ball', 'unit', 'chaos', 5, 6, 'Rare'),
  c('quick-jab', 'Quick Jab', 'spell', 'fury', 1, null),
  c('unstable-bruiser', 'Unstable Bruiser', 'unit', 'chaos', 2, 2),
  c('heavy-hitter', 'Heavy Hitter', 'unit', 'fury', 4, 5),
  c('last-stand', 'Last Stand', 'spell', 'fury', 2, null),
  c('disruptive-hex', 'Disruptive Hex', 'spell', 'chaos', 2, null),
  c('resolute-vanguard', 'Resolute Vanguard', 'unit', 'fury', 3, 4),
  c('counter-spell', 'Counterstrike', 'spell', 'fury', 2, null),
  c('big-finish', 'Big Finish', 'spell', 'chaos', 4, null, 'Rare'),
  c('fury-rune', 'Fury Rune', 'rune', 'fury', null, null),
  c('chaos-rune', 'Chaos Rune', 'rune', 'chaos', null, null),
  c('bf-the-pit', 'The Pit', 'battlefield', null, null, null),
  c('bf-factory', 'Abandoned Factory', 'battlefield', null, null, null),
  c('bf-arena', 'Underground Arena', 'battlefield', null, null, null),
  c('irelia-legend', 'Irelia, the Blade Dancer', 'legend', null, null, null, 'Legendary'),
c('irelia-champ', 'Irelia, Bladesurge', 'champion', 'calm', 5, 5, 'Epic', ['Quickstrike']),
];
export const cardsById: Record<string, Card> = Object.fromEntries(cards.map((x) => [x.id, x]));

// ----- Deck (40 / 12 / 3 / 8, 3 even plans) -----
export const dummyDeckList: Deck[] = [{
  id: 'deck-vi-aggro', 
  name: 'Vi Aggro', 
  domains: ['fury', 'chaos'],
  favorited: true,
  legend: 'vi-legend', 
  chosenChampionId: 'vi-champ',
  mainBoard: [
    { cardId: 'vi-champ', quantity: 2 }, { cardId: 'shock-trooper', quantity: 3 },
    { cardId: 'brawler', quantity: 3 }, { cardId: 'street-tough', quantity: 3 },
    { cardId: 'reckless-charge', quantity: 3 }, { cardId: 'demolish', quantity: 2 },
    { cardId: 'riot-instigator', quantity: 3 }, { cardId: 'chaos-bolt', quantity: 3 },
    { cardId: 'enforcer-squad', quantity: 3 }, { cardId: 'overdrive', quantity: 2 },
    { cardId: 'wrecking-ball', quantity: 2 }, { cardId: 'quick-jab', quantity: 3 },
    { cardId: 'unstable-bruiser', quantity: 3 }, { cardId: 'heavy-hitter', quantity: 3 },
    { cardId: 'last-stand', quantity: 2 },
  ],
  runeDeck: [{ cardId: 'fury-rune', quantity: 6 }, { cardId: 'chaos-rune', quantity: 6 }],
  battlefields: ['bf-the-pit', 'bf-factory', 'bf-arena'],
  sideBoard: [
    { cardId: 'disruptive-hex', quantity: 2 }, { cardId: 'resolute-vanguard', quantity: 2 },
    { cardId: 'counter-spell', quantity: 2 }, { cardId: 'big-finish', quantity: 2 },
  ],
  sideBoardPlans: [
    { id: 'plan-vs-draven', vs: 'Draven Aggro',
      out: [{ cardId: 'reckless-charge', quantity: 2 }, { cardId: 'brawler', quantity: 1 }],
      in: [{ cardId: 'disruptive-hex', quantity: 2 }, { cardId: 'resolute-vanguard', quantity: 1 }],
      notes: 'Hex clears their small units; Vanguard holds the lane. Mulligan for 2-drops.' },
    { id: 'plan-vs-control', vs: 'Control',
      out: [{ cardId: 'street-tough', quantity: 3 }],
      in: [{ cardId: 'big-finish', quantity: 2 }, { cardId: 'counter-spell', quantity: 1 }],
      notes: 'Cut fragile 1-drops; add reach + a counter for their stabilizer.' },
    { id: 'plan-vs-mirror', vs: 'Mirror',
      out: [{ cardId: 'demolish', quantity: 2 }],
      in: [{ cardId: 'resolute-vanguard', quantity: 1 }, { cardId: 'counter-spell', quantity: 1 }],
      notes: 'Trades matter more than reach. Bigger bodies win the board.' },
  ],
  createdBy: "2026/11/22",
  lastUpdated: "2026/11/22"
},
{
  id: 'deck-irelia-tempo',
  name: 'Irelia Tempo',
  domains: ['calm', 'order'],
  favorited: false,
  legend: 'irelia-legend',
  chosenChampionId: 'irelia-champ',
  mainBoard: [
    { cardId: 'irelia-champ', quantity: 2 }, { cardId: 'lawkeeper', quantity: 3 },
    { cardId: 'shield-bearer', quantity: 3 }, { cardId: 'demacian-soldier', quantity: 3 },
    { cardId: 'serene-guardian', quantity: 3 }, { cardId: 'tranquil-ward', quantity: 3 },
    { cardId: 'ironclad-defender', quantity: 3 }, { cardId: 'prismatic-barrier', quantity: 3 },
    { cardId: 'stalwart-guard', quantity: 3 }, { cardId: 'honor-guard', quantity: 3 },
    { cardId: 'rallying-cry', quantity: 2 }, { cardId: 'moonlight-sentry', quantity: 2 },
    { cardId: 'gentle-rebuke', quantity: 3 }, { cardId: 'calming-presence', quantity: 2 },
    { cardId: 'natures-bloom', quantity: 2 },
  ],
  runeDeck: [{ cardId: 'calm-rune', quantity: 6 }, { cardId: 'order-rune', quantity: 6 }],
  battlefields: ['bf-the-pit', 'bf-factory', 'bf-arena'],
  sideBoard: [
    { cardId: 'nullify', quantity: 2 }, { cardId: 'serene-bulwark', quantity: 2 },
    { cardId: 'vanguard-knight', quantity: 2 }, { cardId: 'unbreakable-will', quantity: 2 },
  ],
  sideBoardPlans: [
    { id: 'irelia-vs-aggro', vs: 'Aggro',
      out: [{ cardId: 'natures-bloom', quantity: 2 }],
      in: [{ cardId: 'nullify', quantity: 2 }],
      notes: 'Trim slow value cards for cheap interaction to survive the rush.' },
    { id: 'irelia-vs-control', vs: 'Control',
      out: [{ cardId: 'stalwart-guard', quantity: 2 }],
      in: [{ cardId: 'vanguard-knight', quantity: 2 }],
      notes: 'Their removal is dead on small bodies — bring resilient threats.' },
    { id: 'irelia-vs-midrange', vs: 'Midrange',
      out: [{ cardId: 'calming-presence', quantity: 2 }],
      in: [{ cardId: 'serene-bulwark', quantity: 1 }, { cardId: 'unbreakable-will', quantity: 1 }],
      notes: 'Win the board with stickier blockers and protect your tempo.' },
  ],
  createdBy: "2026/11/22",
  lastUpdated: "2026/11/22",
}];

// ----- Helpers for the sideboard page -----
export const resolveCard = (id: string) => cardsById[id];
export const slotsTotal = (s: CardSlot[]) => s.reduce((t, x) => t + x.quantity, 0);
export const isPlanEven = (p: SideBoardPlan) => slotsTotal(p.in) === slotsTotal(p.out);
export const sideOutPool = (d: Deck) => d.mainBoard.map((s) => cardsById[s.cardId]).filter(Boolean);
export const sideInPool = (d: Deck) => d.sideBoard.map((s) => cardsById[s.cardId]).filter(Boolean);