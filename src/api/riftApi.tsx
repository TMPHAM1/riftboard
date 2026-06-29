import AsyncStorage from "@react-native-async-storage/async-storage";
import { RiftCard } from "@/types/rift";

const LEGENDS_CACHE_KEY = "riftboard:legends";
const LEGENDS_CACHE_TTL = 24 * 60 * 60 * 1000;

export class RiftAPI {
  private static readonly BASE_URL = "https://api.riftcodex.com";

  private static legendsCache: string[] | null = null;

  static async getLegends(): Promise<string[]> {
    if (this.legendsCache) return this.legendsCache;

    // Reuse AsyncStorage cache if fetched within the last 24h
    try {
      const raw = await AsyncStorage.getItem(LEGENDS_CACHE_KEY);
      if (raw) {
        const { names, fetched_at } = JSON.parse(raw);
        if (Date.now() - fetched_at < LEGENDS_CACHE_TTL) {
          this.legendsCache = names;
          return names;
        }
      }
    } catch {}

    // Fetch fresh — paginate all cards, keep base champion names only
    const seen = new Set<string>();
    const names: string[] = [];
    let page = 1;
    const size = 100;
    let totalPages = 1;

    try {
      do {
        const res = await fetch(`${this.BASE_URL}/cards?page=${page}&size=${size}`);
        if (!res.ok) break;
        const data = await res.json();
        totalPages = Math.ceil((data.total ?? 0) / size);

        for (const card of (data.items ?? [])) {
          if (
            card.classification?.type === "Legend" &&
            card.set?.set_id !== "OPP" &&        // exclude Metal/Promo variants
            !card.metadata?.alternate_art &&
            !card.metadata?.signature &&
            !card.metadata?.overnumbered
          ) {
            // "Irelia - Blade Dancer" → "Irelia"
            const baseName = (card.name as string).split(" - ")[0].trim();
            if (!seen.has(baseName)) {
              seen.add(baseName);
              names.push(baseName);
            }
          }
        }
        page++;
      } while (page <= totalPages);
    } catch (err) {
      console.error("Failed to fetch legends:", err);
    }

    names.sort();
    this.legendsCache = names;

    // Persist so next session skips the full paginated fetch
    try {
      await AsyncStorage.setItem(
        LEGENDS_CACHE_KEY,
        JSON.stringify({ names, fetched_at: Date.now() }),
      );
    } catch {}

    return names;
  }

  // Extract first card from paginated response shape { items: RiftCard[], ... }
  private static extractFirst(data: any): RiftCard | null {
    if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
      return data.items[0] as RiftCard;
    }
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as RiftCard;
    }
    return null;
  }

  // Get cards by exact name - MOST RELIABLE FOR DECK IMPORT
  static async getCardByExactName(name: string): Promise<RiftCard | null> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/cards/name?exact=${encodeURIComponent(name)}`,
      );
      if (!response.ok) return null;
      return this.extractFirst(await response.json());
    } catch (error) {
      console.error(`Failed to fetch card "${name}":`, error);
      return null;
    }
  }

  // Fuzzy name search - fallback if exact doesn't work
  static async getCardByFuzzyName(name: string): Promise<RiftCard | null> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/cards/name?fuzzy=${encodeURIComponent(name)}`,
      );
      if (!response.ok) return null;
      return this.extractFirst(await response.json());
    } catch (error) {
      console.error(`Failed to fuzzy search "${name}":`, error);
      return null;
    }
  }

  // Batch fetch multiple cards (no batch endpoint, so we parallelize)
  static async getCardsByNames(names: string[]): Promise<{
    found: Map<string, RiftCard>;
    missing: string[];
  }> {
    const found = new Map<string, RiftCard>();
    const missing: string[] = [];

    // Process in batches to avoid overwhelming the API
    const batchSize = 5; // 5 parallel requests at a time

    for (let i = 0; i < names.length; i += batchSize) {
      const batch = names.slice(i, i + batchSize);

      // Try exact match first for all cards in batch
      const promises = batch.map(async (name) => {
        let card = await this.getCardByExactName(name);

        // If exact match fails, try fuzzy
        if (!card) {
          card = await this.getCardByFuzzyName(name);
        }

        if (card) {
          found.set(name, card);
        } else {
          missing.push(name);
        }
      });

      await Promise.all(promises);

      // Be nice to the API - small delay between batches
      if (i + batchSize < names.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    return { found, missing };
  }

  // Get paginated cards (useful for browsing)
  static async getCards(options?: {
    page?: number;
    size?: number;
    set_id?: string;
    sort?: string;
    dir?: 1 | -1;
  }): Promise<RiftCard[]> {
    const url = new URL(`${this.BASE_URL}/cards`);

    if (options?.page) url.searchParams.append("page", options.page.toString());
    if (options?.size)
      url.searchParams.append("size", Math.min(options.size, 100).toString());
    if (options?.set_id) url.searchParams.append("set_id", options.set_id);
    if (options?.sort) url.searchParams.append("sort", options.sort);
    if (options?.dir) url.searchParams.append("dir", options.dir.toString());

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to get cards:", error);
      return [];
    }
  }

  // Search cards by text (WIP according to docs but let's try)
  static async searchCards(query: string): Promise<RiftCard[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/cards/search?query=${encodeURIComponent(query)}`,
      );

      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  }

  // Get card by Riftbound ID (e.g., "OGN-011-298")
  static async getCardByRiftboundId(id: string): Promise<RiftCard | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/cards/riftbound/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to get card by Riftbound ID "${id}":`, error);
      return null;
    }
  }
}
