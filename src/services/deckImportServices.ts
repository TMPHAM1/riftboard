
  import { Card } from '@/data/mockDeckData';
import { Deck, DeckCard, ParsedDeckList, RiftCard } from '@/types/rift';
import { DeckParser } from '@/utils/deckParser';
import { v4 as uuidv4 } from 'uuid';
import { RiftAPI } from '../api/riftApi';

  export class DeckImportService {

    static async importDeck(
      deckText: string,
      deckName?: string
    ): Promise<Deck> {
      console.log('📝 Parsing deck list...');
      const parsed = DeckParser.parse(deckText);

      console.log('✅ Validating deck...');
      const validation = DeckParser.validate(parsed);
      if (!validation.valid) {
        throw new Error(`Invalid deck:\n${validation.errors.join('\n')}`);
      }

      console.log('🔍 Fetching card data...');
      const uniqueNames = this.extractUniqueCardNames(parsed);
      console.log(`Found ${uniqueNames.length} unique cards to fetch`);

      // Fetch all cards
      const { found, missing } = await RiftAPI.getCardsByNames(uniqueNames);

      if (missing.length > 0) {
        console.warn('⚠️ Missing cards:', missing);
        // You might want to show this to user or handle differently
      }

      console.log(`✅ Found ${found.size} cards`);

      // Build the deck
      const deck = this.buildDeck(parsed, found, deckName);

      return deck;
    }

    private static extractUniqueCardNames(parsed: ParsedDeckList): string[] {
      const names = new Set<string>();

      if (parsed.legend) names.add(parsed.legend);
      if (parsed.champion) names.add(parsed.champion);

      [
        ...parsed.main_deck,
        ...parsed.battlefields,
        ...parsed.runes,
        ...parsed.sideboard
      ].forEach(card => names.add(card.name));

      return Array.from(names);
    }

    private static buildDeck(
      parsed: ParsedDeckList,
      cardMap: Map<string, RiftCard>,
      deckName?: string
    ): Deck {
      const now = new Date().toISOString();

      // Helper to create DeckCard entries
      const toDeckCards = (cards: Array<{ quantity: number; name: string }>): DeckCard[] => {
        return cards.map(({ quantity, name }) => ({
          quantity,
          card_name: name,
          card_data: cardMap.get(name)
        }));
      };

      const toSingleCard = (name?: string): DeckCard | undefined => {
        if (!name) return undefined;
        return {
          quantity: 1,
          card_name: name,
          card_data: cardMap.get(name)
        };
      };

      // Calculate energy curve
      const calculateEnergyCurve = (): number[] => {
        const curve = new Array(10).fill(0); // 0-9+ energy

        [...parsed.main_deck, ...parsed.battlefields].forEach(({ quantity, name }) => {
          const card = cardMap.get(name);
          if (card?.attributes?.energy !== undefined) {
            const energy = Math.min(card.attributes.energy, 9);
            curve[energy] += quantity;
          }
        });

        return curve;
      };

      // Get unique domains
      const getUniqueDomains = (): string[] => {
        const domains = new Set<string>();

        cardMap.forEach(card => {
          card.classification.domain?.forEach(d => domains.add(d));
        });

        return Array.from(domains);
      };

      const deck: Deck = {
        id: uuidv4(),
        name: deckName || `Imported ${new Date().toLocaleDateString()}`,

        legend: toSingleCard(parsed.legend),
        champion: toSingleCard(parsed.champion),
        main_deck: toDeckCards(parsed.main_deck),
        battlefields: toDeckCards(parsed.battlefields),
        runes: toDeckCards(parsed.runes),
        sideboard: toDeckCards(parsed.sideboard),

        created_at: now,
        updated_at: now,

        total_cards: this.calculateTotalCards(parsed),
        total_energy_curve: calculateEnergyCurve(),
        domains_used: getUniqueDomains(),

        import_source: 'paste'
      };

      return deck;
    }

    private static calculateTotalCards(parsed: ParsedDeckList): number {
      let total = 0;
      if (parsed.legend) total++;
      if (parsed.champion) total++;

      [parsed.main_deck, parsed.battlefields, parsed.runes, parsed.sideboard]
        .forEach(section => {
          total += section.reduce((sum: number, card: Card) => sum + card.quantity, 0);
        });

      return total;
    }
  }