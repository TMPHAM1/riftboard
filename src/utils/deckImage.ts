import { Deck } from "@/types/rift";

// Picks the deck's "hero" image: the legend's art (the deck identity) if we have
// it, else the champion's, else the first main-deck card with an image. Returns
// undefined when no card data has images (e.g. an older/partial import).
export function deckCoverUrl(deck: Deck): string | undefined {
  return (
    deck.legend?.card_data?.media?.image_url ??
    deck.champion?.card_data?.media?.image_url ??
    deck.main_deck.find((c) => c.card_data?.media?.image_url)?.card_data?.media
      ?.image_url
  );
}
