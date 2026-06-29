import { CardSlot, Deck, DeckCard, RiftCard, SideBoardPlan } from '@/types/rift';

export type { CardSlot, SideBoardPlan };

// ---- helpers ----

const img = (name: string, color = '3a3a3a') =>
  `https://placehold.co/220x307/${color}/ffffff?text=${encodeURIComponent(name)}`;

function rift(
  name: string,
  type: RiftCard['classification']['type'],
  domains: string[],
  energy: number | undefined,
  plain: string,
  rarity: RiftCard['classification']['rarity'] = 'Common',
): RiftCard {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id,
    name,
    riftbound_id: `MOCK-${id.substring(0, 8).toUpperCase()}`,
    collector_number: 0,
    attributes: { energy },
    classification: { type, rarity, domain: domains },
    text: { rich: plain, plain },
    set: { set_id: 'MOCK', label: 'Mock Set' },
    media: { image_url: img(name, '1565c0'), artist: 'Mock Artist', accessibility_text: name },
    tags: domains,
    orientation: 'portrait',
    metadata: { clean_name: name, updated_on: '2026-01-01T00:00:00.000Z', alternate_art: false, overnumbered: false, signature: false },
  };
}

const dc = (card_name: string, quantity: number, card_data: RiftCard): DeckCard =>
  ({ quantity, card_name, card_data });

// ---- Irelia deck card catalog ----

const ireliaLegend   = rift('Irelia, the Blade Dancer', 'Unit',  [],       undefined, 'Strike with grace and precision.',           'Legendary');
const ireliaChamp    = rift('Irelia, Bladesurge',        'Unit',  ['Calm'], 5,         'Quickstrike. When an ally dies, gain +1 might.', 'Epic');
const edgeOfNight    = rift('Edge of Night',             'Spell', ['Calm'], 2,         'Give a unit Stealth until end of turn.');
const enGarde        = rift('En Garde',                  'Spell', ['Calm'], 1,         'Give a unit +1 might and Barrier this turn.');
const flash          = rift('Flash',                     'Spell', ['Calm'], 0,         'Play any unit as if it has Flash.');
const guardianAngel  = rift('Guardian Angel',            'Spell', ['Calm'], 3,         'Fully heal a unit and give it Barrier.');
const disarmingRake  = rift('Disarming Rake',            'Spell', ['Calm'], 2,         'Stun a unit until end of turn.');
const gust           = rift('Gust',                      'Spell', ['Calm'], 1,         'Return a unit to its owner\'s hand.');
const notSoFast      = rift('Not So Fast',               'Spell', ['Calm'], 1,         'Counter a spell that targets one of your units.');
const rebuke         = rift('Rebuke',                    'Spell', ['Calm'], 3,         'Destroy a unit with 3 or less might.');
const vexCheerless   = rift('Vex, Cheerless',            'Unit',  ['Calm'], 4,         'When an enemy casts a spell, deal 1 to their legend.', 'Rare');

// ---- Deck ----

export const dummyDeckList: Deck[] = [
  {
    id: 'deck-irelia',
    name: 'Irelia',
    legend: dc('Irelia, the Blade Dancer', 1, ireliaLegend),
    champion: dc('Irelia, Bladesurge', 2, ireliaChamp),
    main_deck: [
      dc('Irelia, Bladesurge', 2, ireliaChamp),
      dc('Edge of Night',      1, edgeOfNight),
      dc('En Garde',           2, enGarde),
      dc('Flash',              1, flash),
      dc('Guardian Angel',     2, guardianAngel),
      dc('Disarming Rake',     1, disarmingRake),
      dc('Gust',               1, gust),
      dc('Not So Fast',        1, notSoFast),
      dc('Rebuke',             1, rebuke),
      dc('Vex, Cheerless',     1, vexCheerless),
    ],
    runes: [],
    battlefields: [],
    sideboard: [
      dc('Guardian Angel',  2, guardianAngel),
      dc('Not So Fast',     1, notSoFast),
      dc('Rebuke',          1, rebuke),
      dc('Gust',            1, gust),
    ],
    sideboard_plans: [
      {
        id: 'plan-vs-aggro', vs: 'Aggro',
        out: [],
        in:  [],
        notes: '',
      },
      {
        id: 'plan-vs-control', vs: 'Control',
        out: [],
        in:  [],
        notes: '',
      },
    ],
    created_at: '2026-06-27T00:31:28.140Z',
    updated_at: '2026-06-27T00:31:28.140Z',
    total_cards: 64,
  },
];

// ---- helpers ----

export const slotsTotal = (s: CardSlot[]) => s.reduce((t, x) => t + x.quantity, 0);
export const isPlanEven = (p: SideBoardPlan) => slotsTotal(p.in) === slotsTotal(p.out);
