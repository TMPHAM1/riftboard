import AsyncStorage from "@react-native-async-storage/async-storage";
import { RiftCard } from "@/types/rift";

const LEGENDS_CACHE_KEY = "riftboard:legends";
const LEGENDS_CACHE_TTL = 24 * 60 * 60 * 1000;

// A specific legend printing, e.g. { name: "Master Yi - Wuju Master", image_url }.
export interface LegendVersion {
  name: string;
  image_url?: string;
}

export class RiftAPI {
  private static readonly BASE_URL = "https://api.riftcodex.com";

  private static legendsCache: string[] | null = null;
  private static legendImagesCache: Record<string, string> | null = null;
  private static legendVersionsCache: LegendVersion[] | null = null;
  // Shared in-flight fetch so concurrent callers don't each paginate the API.
  private static legendDataPromise: Promise<{
    names: string[];
    images: Record<string, string>;
    versions: LegendVersion[];
  }> | null = null;

  // Base legend names (deduped per hero), sorted. Backed by the shared cache.
  static async getLegends(): Promise<string[]> {
    return (await this.loadLegendData()).names;
  }

  // Map of base legend name → card image URL.
  static async getLegendImages(): Promise<Record<string, string>> {
    return (await this.loadLegendData()).images;
  }

  // Every specific legend printing (full names, incl. multiple versions of a
  // hero like the two Master Yi legends), sorted by name.
  static async getLegendVersions(): Promise<LegendVersion[]> {
    return (await this.loadLegendData()).versions;
  }

  // Map of full legend printing name → image URL (for opponent thumbnails).
  static async getLegendVersionImages(): Promise<Record<string, string>> {
    const versions = (await this.loadLegendData()).versions;
    const map: Record<string, string> = {};
    for (const v of versions) if (v.image_url) map[v.name] = v.image_url;
    return map;
  }

  // Returns legend data from the in-memory cache, or kicks off a single shared
  // fetch. Concurrent callers (e.g. getLegendImages + getLegendVersionImages)
  // await the same promise instead of paginating the API twice.
  private static async loadLegendData(): Promise<{
    names: string[];
    images: Record<string, string>;
    versions: LegendVersion[];
  }> {
    if (this.legendsCache && this.legendImagesCache && this.legendVersionsCache) {
      return {
        names: this.legendsCache,
        images: this.legendImagesCache,
        versions: this.legendVersionsCache,
      };
    }
    if (!this.legendDataPromise) {
      this.legendDataPromise = this.fetchLegendData();
    }
    try {
      return await this.legendDataPromise;
    } finally {
      this.legendDataPromise = null;
    }
  }

  private static async fetchLegendData(): Promise<{
    names: string[];
    images: Record<string, string>;
    versions: LegendVersion[];
  }> {
    // Reuse AsyncStorage cache if fresh AND it has the versions field
    try {
      const raw = await AsyncStorage.getItem(LEGENDS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed.names?.length > 0 &&   // ignore a previously-cached empty result
          parsed.images &&
          parsed.versions &&
          Date.now() - parsed.fetched_at < LEGENDS_CACHE_TTL
        ) {
          this.legendsCache = parsed.names;
          this.legendImagesCache = parsed.images;
          this.legendVersionsCache = parsed.versions;
          return {
            names: parsed.names,
            images: parsed.images,
            versions: parsed.versions,
          };
        }
      }
    } catch {}

    // Fetch page 1 to learn the total, then pull the rest in parallel.
    const size = 100;
    const allItems: any[] = [];
    try {
      const first = await fetch(`${this.BASE_URL}/cards?page=1&size=${size}`);
      if (first.ok) {
        const data = await first.json();
        allItems.push(...(data.items ?? []));
        const totalPages = Math.ceil((data.total ?? 0) / size);
        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              fetch(`${this.BASE_URL}/cards?page=${i + 2}&size=${size}`)
                .then((r) => (r.ok ? r.json() : { items: [] }))
                .then((d) => d.items ?? [])
                .catch(() => []),
            ),
          );
          for (const items of rest) allItems.push(...items);
        }
      }
    } catch (err) {
      console.error("Failed to fetch legends:", err);
    }

    const seen = new Set<string>();
    const names: string[] = [];
    const images: Record<string, string> = {};
    const versions: LegendVersion[] = [];
    const versionSeen = new Set<string>();
    // Tracks heroes whose stored image is from a "canonical" (non-parenthetical)
    // printing, so a later "(Starter)"-style variant won't overwrite it.
    const canonicalImg = new Set<string>();

    for (const card of allItems) {
      if (
        card.classification?.type === "Legend" &&
        card.set?.set_id !== "OPP" &&        // exclude Metal/Promo variants
        !card.metadata?.alternate_art &&
        !card.metadata?.signature &&
        !card.metadata?.overnumbered
      ) {
        const fullName = (card.name as string).trim();
        const url = card.media?.image_url;

        // Version-level entry: keep every distinct printing (full name).
        if (!versionSeen.has(fullName)) {
          versionSeen.add(fullName);
          versions.push({ name: fullName, image_url: url });
        }

        // "Irelia - Blade Dancer" → "Irelia". Collapses every printing of a
        // hero (incl. the two Master Yi legends) to one base entry.
        const baseName = fullName.split(" - ")[0].trim();
        if (!seen.has(baseName)) {
          seen.add(baseName);
          names.push(baseName);
        }
        // Prefer a canonical printing for the base thumbnail: skip
        // parenthetical variants like "(Starter)" when a plain one exists.
        if (url) {
          const canonical = !fullName.includes("(");
          if (!(baseName in images) || (canonical && !canonicalImg.has(baseName))) {
            images[baseName] = url;
            if (canonical) canonicalImg.add(baseName);
          }
        }
      }
    }

    names.sort();
    versions.sort((a, b) => a.name.localeCompare(b.name));

    // Only cache a successful (non-empty) result. If the fetch failed/returned
    // nothing, leave caches unset so the next call retries instead of getting
    // stuck on an empty result forever.
    if (names.length > 0) {
      this.legendsCache = names;
      this.legendImagesCache = images;
      this.legendVersionsCache = versions;
      try {
        await AsyncStorage.setItem(
          LEGENDS_CACHE_KEY,
          JSON.stringify({ names, images, versions, fetched_at: Date.now() }),
        );
      } catch {}
    }

    return { names, images, versions };
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
