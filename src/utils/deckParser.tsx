// src/utils/deckParser.ts

import { Deck, ParsedDeckList } from "@/types/rift";

// Reconstructs the standard import text from a saved Deck object.
// Used to pre-fill the Edit Deck textarea so the user sees the familiar format.
export function deckToText(deck: Deck): string {
  const lines: string[] = [];

  if (deck.legend) {
    lines.push("Legend:");
    lines.push(`${deck.legend.quantity} ${deck.legend.card_name}`);
    lines.push("");
  }

  if (deck.champion) {
    lines.push("Champion:");
    lines.push(`${deck.champion.quantity} ${deck.champion.card_name}`);
    lines.push("");
  }

  if (deck.main_deck.length > 0) {
    lines.push("MainDeck:");
    deck.main_deck.forEach((c) => lines.push(`${c.quantity} ${c.card_name}`));
    lines.push("");
  }

  if (deck.battlefields.length > 0) {
    lines.push("Battlefields:");
    deck.battlefields.forEach((c) =>
      lines.push(`${c.quantity} ${c.card_name}`),
    );
    lines.push("");
  }

  if (deck.runes.length > 0) {
    lines.push("Runes:");
    deck.runes.forEach((c) => lines.push(`${c.quantity} ${c.card_name}`));
    lines.push("");
  }

  if (deck.sideboard.length > 0) {
    lines.push("Sideboard:");
    deck.sideboard.forEach((c) => lines.push(`${c.quantity} ${c.card_name}`));
  }

  return lines.join("\n");
}

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

    // Legend is required
    if (!deck.legend) {
      errors.push("A Legend card is required.");
    }

    // Champion is required and must share the legend's first name
    // e.g. legend "Irelia, Blade Dancer" → champion must contain "Irelia"
    if (!deck.champion) {
      errors.push("A Champion unit is required.");
    } else if (deck.legend) {
      const legendFirstName = deck.legend.split(/[\s,]+/)[0];
      if (
        !deck.champion.toLowerCase().includes(legendFirstName.toLowerCase())
      ) {
        errors.push(
          `Champion "${deck.champion}" must match the legend "${deck.legend}" (both should share the name "${legendFirstName}").`,
        );
      }
    }

    // Main deck must be exactly 39 cards
    const mainDeckCount = deck.main_deck.reduce(
      (sum, card) => sum + card.quantity,
      0,
    );
    if (mainDeckCount !== 39) {
      errors.push(
        `Main deck must be exactly 39 cards (currently ${mainDeckCount}).`,
      );
    }

    // Minimum 12 runes required
    const runeCount = deck.runes.reduce((sum, card) => sum + card.quantity, 0);
    if (runeCount !== 12) {
      errors.push(`At least 12 runes are required (currently ${runeCount}).`);
    }

    // Max 3 copies of any single card across main deck and sideboard
    const cardCounts = new Map<string, number>();
    [...deck.main_deck, ...deck.sideboard].forEach(({ name, quantity }) => {
      cardCounts.set(name, (cardCounts.get(name) ?? 0) + quantity);
    });
    for (const [name, count] of cardCounts.entries()) {
      if (count > 3) {
        errors.push(`"${name}" has ${count} copies (maximum 3).`);
      }
    }

    // Sideboard must be exactly 0 or exactly 8 cards — nothing in between
    const sideboardCount = deck.sideboard.reduce(
      (sum, card) => sum + card.quantity,
      0,
    );
    if (sideboardCount !== 0 && sideboardCount !== 8) {
      errors.push(
        `Sideboard must be exactly 0 or 8 cards (currently ${sideboardCount}).`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
