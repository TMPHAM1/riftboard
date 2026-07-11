import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck, SideBoardPlan } from '@/types/rift';

// All decks (including their sideboard_plans) are stored as a single JSON
// array under this key. Each Deck object contains the full card data
// (card_data: RiftCard) fetched at import time, so no further API calls
// are needed to display cards or images after the first import.
const KEY = 'riftboard:decks';

export async function loadDecks(): Promise<Deck[]> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveDeck(deck: Deck): Promise<void> {
  const decks = await loadDecks();
  const idx = decks.findIndex((d) => d.id === deck.id);
  if (idx >= 0) {
    const existing = decks[idx];
    // When overwriting an existing deck, carry over sideboard plans but
    // prune any slots whose card no longer exists in the updated card pool.
    const validCards = new Set([
      ...deck.main_deck.map((c) => c.card_name),
      ...(deck.sideboard ?? []).map((c) => c.card_name),
    ]);
    const prunedPlans = (existing.sideboard_plans ?? []).map((plan) => ({
      ...plan,
      out: plan.out.filter((slot) => validCards.has(slot.cardId)),
      in: plan.in.filter((slot) => validCards.has(slot.cardId)),
    }));
    decks[idx] = { ...deck, sideboard_plans: prunedPlans };
  } else {
    decks.push(deck);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(decks));
}

export async function updateSideboardPlans(
  deckId: string,
  plans: SideBoardPlan[],
): Promise<void> {
  const decks = await loadDecks();
  const idx = decks.findIndex((d) => d.id === deckId);
  if (idx < 0) return;
  decks[idx] = {
    ...decks[idx],
    sideboard_plans: plans,
    updated_at: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(decks));
}

export async function deleteDeck(id: string): Promise<void> {
  const decks = await loadDecks();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(decks.filter((d) => d.id !== id)),
  );
}

// Wipes all locally-stored decks and sideboard plans. Used by Settings →
// "Clear local data". Also clears the cached legends list.
export async function clearAllDecks(): Promise<void> {
  await AsyncStorage.multiRemove([KEY, 'riftboard:legends']);
}
