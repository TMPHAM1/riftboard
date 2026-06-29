  
  
  export interface RiftCard {
    id: string;                  // Unique RiftCodex identifier
    name: string;
    riftbound_id: string;        // The actual game ID
    collector_number: number;
    attributes: CardAttributes;
    classification: CardClassification;
    text: CardText;
    set: CardSet;
    media: CardMedia;
    tags: string[];              // ["Freljord", "Noxus", etc]
    orientation: 'portrait' | 'landscape';
    metadata: CardMetadata;
  }


  export interface CardAttributes {
    energy?: number;    // Cost to play
    might?: number;     // Attack equivalent
    power?: number;     // Health/Defense equivalent
  }

  export interface CardClassification {
    type: CardType;           // "Unit", "Spell", etc
    supertype?: CardSupertype; // "Champion", "Token", etc
    rarity: CardRarity;       // "Common", "Rare", etc
    domain: string[];         // ["Fury", "Chaos", etc]
  }

  export interface CardText {
    rich: string;      // Text with formatting tags
    plain: string;     // Plain text version
    flavour?: string;  // Flavor text if any
  }

  export interface CardSet {
    set_id: string;    // "OGN", "OGS", etc
    label: string;     // "Origins", "Spiritforged", etc
  }

  export interface CardMedia {
    image_url: string;
    artist: string;
    accessibility_text: string;
  }

  export interface CardMetadata {
    clean_name: string;        // Name without special characters
    updated_on: string;        // ISO 8601 timestamp
    alternate_art: boolean;
    overnumbered: boolean;
    signature: boolean;
  }

  // Enums based on actual game values
  export type CardType =
    | 'Unit'
    | 'Spell'
    | 'Item'
    | 'Landmark'  // Battlefields might be called Landmarks
    | 'Rune';

  export type CardSupertype =
    | 'Champion'
    | 'Legend'
    | 'Token';

  export type CardRarity =
    | 'Common'
    | 'Rare'
    | 'Epic'
    | 'Legendary';

  // API Request Types
  export type CardSortCategory =
    | 'name'
    | 'collector_number'
    | 'public_code'
    | 'type'
    | 'supertype'
    | 'rarity'
    | 'domain'
    | 'artist'
    | 'set_id'
    | 'set_label'
    | 'energy'
    | 'might'
    | 'power';

  // ========== Our App Types ==========

  export interface DeckCard {
    quantity: number;
    card_name: string;
    card_data?: RiftCard;  // Populated after fetch
  }

  export interface ParsedDeckList {
    legend?: string;
    champion?: string;
    main_deck: Array<{ quantity: number; name: string }>;
    battlefields: Array<{ quantity: number; name: string }>;  // Might be Landmarks
    runes: Array<{ quantity: number; name: string }>;
    sideboard: Array<{ quantity: number; name: string }>;

    raw_text: string;
    parsed_at: string;
  }

  export interface Deck {
    // Identity
    id: string;
    name: string;

    // Deck composition (using RiftCodex data)
    legend?: DeckCard;
    champion?: DeckCard;
    main_deck: DeckCard[];
    battlefields: DeckCard[];
    runes: DeckCard[];
    sideboard: DeckCard[];

    // Metadata
    user_id?: string;
    created_at: string;
    updated_at: string;

    // Game tracking
    current_game?: GameSession;

    // Stats
    total_cards: number;
    total_energy_curve?: number[];  // Distribution of energy costs
    domains_used?: string[];        // Unique domains in deck

    // Import info
    import_source?: 'paste' | 'url' | 'file';
    source_url?: string;

    // App-level sideboard planning
    sideboard_plans?: SideBoardPlan[];
  }

  export type CardSlot = { cardId: string; quantity: number };

  export type SideBoardPlan = {
    id: string;
    vs: string;
    out: CardSlot[];
    in: CardSlot[];
    vsLegend?: string;   // the opponent's legend this plan is built against
    swapChampionTo?: string;
    notes?: string;
  };

  export interface GameSession {
    id: string;
    started_at: string;
    swaps: SideboardSwap[];
  }

  export interface SideboardSwap {
    timestamp: string;
    cards_in: string[];
    cards_out: string[];
    notes?: string;
  }

