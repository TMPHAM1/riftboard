// src/utils/deckParser.ts

import { ParsedDeckList } from "@/types/rift";

export class DeckParser {
  // Map section headers to our structure
  private static readonly SECTION_MAP: Record<string, keyof ParsedDeckList> = {
    legend: "legend",
    champion: "champion",
    maindeck: "main_deck",
    "main deck": "main_deck",
    deck: "main_deck",
    battlefields: "battlefields",
    battlefield: "battlefields",
    runes: "runes",
    rune: "runes",
    sideboard: "sideboard",
    side: "sideboard",
  };

  static parse(deckText: string): ParsedDeckList {
    const result: ParsedDeckList = {
      main_deck: [],
      battlefields: [],
      runes: [],
      sideboard: [],
      raw_text: deckText,
      parsed_at: new Date().toISOString(),
    };

    let currentSection: keyof ParsedDeckList | null = null;
    const lines = deckText.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if this is a section header
      const headerMatch = trimmed.match(/^(.+):$/);
      if (headerMatch) {
        const sectionName = headerMatch[1].toLowerCase();
        currentSection = this.SECTION_MAP[sectionName] || null;
        continue;
      }

      // Parse card line: "3 Card Name" or "Card Name" (implies 1)
      const cardMatch = trimmed.match(/^(\d+)?\s*(.+)$/);
      if (cardMatch && currentSection) {
        const quantity = cardMatch[1] ? parseInt(cardMatch[1]) : 1;
        const cardName = cardMatch[2].trim();

        // Handle single card sections (legend/champion)
        if (currentSection === "legend" || currentSection === "champion") {
          result[currentSection] = cardName;
        }
        // Handle array sections
        else if (Array.isArray(result[currentSection])) {
          (result[currentSection] as any[]).push({
            quantity,
            name: cardName,
          });
        }
      }
    }

    return result;
  }

  static validate(deck: ParsedDeckList): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const mainDeckCount = deck.main_deck.reduce(
      (sum, card) => sum + card.quantity,
      0,
    );
    if (mainDeckCount !== 39) {
      errors.push(
        `Main deck has to be 39 cards, current amount: ${mainDeckCount} `,
      );
    }

    // Check for duplicates over limit (usually 3)
    const cardCounts = new Map<string, number>();
    [...deck.main_deck, ...deck.sideboard].forEach(({ name, quantity }) => {
      const current = cardCounts.get(name) || 0;
      cardCounts.set(name, current + quantity);
    });

    for (const [name, count] of cardCounts.entries()) {
      if (count > 3) {
        errors.push(`"${name}" has ${count} copies (maximum 3)`);
      }
    }

    // Check sideboard size (typically exactly 7)
    const sideboardCount = deck.sideboard.reduce(
      (sum, card) => sum + card.quantity,
      0,
    );
    if (sideboardCount !== 8 && sideboardCount !== 0) {
      errors.push(
        `Sideboard has ${sideboardCount} cards (should be 8 or 0   )`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
