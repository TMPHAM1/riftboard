import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ExportPlansModal from "@/components/ui/ExportPlansModal";
import ImportDeckModal from "@/components/ui/ImportDeckModal";
import NamePromptModal from "@/components/ui/NamePromptModal";
import { BottomTabInset, ContentLayout, Spacing } from "@/constants/theme";
import { RiftAPI } from "@/api/riftApi";
import { deleteDeck, loadDecks, updateSideboardPlans } from "@/services/deckStorageService";
import { deckCoverUrl } from "@/utils/deckImage";
import { Deck, SideBoardPlan } from "@/types/rift";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronDown, ChevronRight, CirclePlus, Pencil, Plus, Share2, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";

// ─── DeckRow ────────────────────────────────────────────────────────────────
// Each deck in the list is rendered as a collapsible row.
// Expanding it reveals the sideboard plans and an "Add sideboard plan" button.

interface DeckRowProps {
  deck: Deck;
  onPlanAdded: (updated: Deck) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deck: Deck) => void;
  onExportDeck: (deck: Deck) => void;
  legendImages: Record<string, string>;
}

function DeckRow({ deck, onPlanAdded, onEditDeck, onDeleteDeck, onExportDeck, legendImages }: DeckRowProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [planToRename, setPlanToRename] = useState<SideBoardPlan | null>(null);
  const router = useRouter();
  const plans = deck.sideboard_plans ?? [];
  const coverUrl = deckCoverUrl(deck);

  useEffect(() => { if (!open) setSearchQuery(""); }, [open]);

  const q = searchQuery.trim().toLowerCase();
  const visiblePlans = q
    ? plans.filter(
        (p) => p.vs.toLowerCase().includes(q) || p.vsLegend?.toLowerCase().includes(q),
      )
    : plans;

  // Creates a new plan with the given name, saves it, then navigates to editor.
  const createPlan = async (planName: string) => {
    const newPlan: SideBoardPlan = {
      id: `plan-${Date.now()}`,
      vs: planName,
      out: [],
      in: [],
    };
    const updatedPlans = [...plans, newPlan];
    await updateSideboardPlans(deck.id, updatedPlans);
    const updatedDeck = { ...deck, sideboard_plans: updatedPlans };
    onPlanAdded(updatedDeck);
    router.push({
      pathname: "/sideboard/[planId]",
      params: { planId: newPlan.id, deckId: deck.id },
    });
  };

  return (
    <>
      <ThemedView style={styles.deckCard}>
        {/* Deck header — tap to expand/collapse */}
        <Pressable
          style={({ pressed }) => [styles.deckHeader, pressed && { opacity: 0.7 }]}
          onPress={() => setOpen((v) => !v)}
        >
          <ThemedView style={styles.deckHeaderLeft}>
            {open
              ? <ChevronDown size={18} color="#B3C9D1" />
              : <ChevronRight size={18} color="#B3C9D1" />}
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={styles.cover} contentFit="contain" />
            ) : (
              <ThemedView style={[styles.cover, styles.coverFallback]} />
            )}
            <ThemedText type="smallBold" style={styles.deckName} numberOfLines={1}>
              {deck.name}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.deckHeaderRight}>
            <ThemedText themeColor="textSecondary">
              {plans.length} {plans.length === 1 ? "plan" : "plans"}
            </ThemedText>
            {plans.length > 0 && (
              <Pressable
                hitSlop={10}
                onPress={(e) => { e.stopPropagation(); onExportDeck(deck); }}
              >
                <Share2 size={16} color="#E78D17" />
              </Pressable>
            )}
            <Pressable
              hitSlop={10}
              onPress={(e) => { e.stopPropagation(); onEditDeck(deck); }}
            >
              <Pencil size={16} color="#B3C9D1" />
            </Pressable>
            <Pressable
              hitSlop={10}
              onPress={(e) => {
                e.stopPropagation();
                onDeleteDeck(deck);
              }}
            >
              <Trash2 size={16} color="#F87171" />
            </Pressable>
          </ThemedView>
        </Pressable>

        {/* Expanded: sideboard plans + add button */}
        {open && (
          <Animated.View entering={FadeIn.duration(150)}>
            <ThemedView style={styles.plansContainer}>
              {/* Search bar — filters by plan name or opponent's legend */}
              {plans.length > 0 && (
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name or opponent…"
                  placeholderTextColor="#7FA3B0"
                  clearButtonMode="while-editing"
                />
              )}

              {visiblePlans.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.noPlansText}>
                  {q ? "No plans match your search." : "No sideboard plans yet."}
                </ThemedText>
              ) : (
                visiblePlans.map((plan) => (
                  <Pressable
                    key={plan.id}
                    style={({ pressed }) => [styles.planRow, pressed && { opacity: 0.7 }]}
                    onPress={() =>
                      router.push({
                        pathname: "/sideboard/[planId]",
                        params: { planId: plan.id, deckId: deck.id },
                      })
                    }
                  >
                    <ThemedView style={styles.planRowContent}>
                      {plan.vsLegend && legendImages[plan.vsLegend] ? (
                        <Image
                          source={{ uri: legendImages[plan.vsLegend] }}
                          style={styles.oppThumb}
                          contentFit="contain"
                        />
                      ) : (
                        <ThemedView style={styles.oppThumb} />
                      )}
                      <ThemedView style={{ flex: 1, backgroundColor: "transparent" }}>
                        <ThemedText type="smallBold">{plan.vs}</ThemedText>
                        <ThemedText themeColor="textSecondary" style={styles.planMeta}>
                          {plan.out.length} out · {plan.in.length} in
                        </ThemedText>
                      </ThemedView>
                      <Pressable
                        hitSlop={10}
                        onPress={(e) => { e.stopPropagation(); setPlanToRename(plan); }}
                      >
                        <Pencil size={14} color="#B3C9D1" />
                      </Pressable>
                      <Pressable
                        hitSlop={10}
                        onPress={(e) => {
                          e.stopPropagation();
                          Alert.alert(
                            "Delete Plan",
                            `Delete "${plan.vs}"? This cannot be undone.`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: async () => {
                                  const remaining = plans.filter((p) => p.id !== plan.id);
                                  await updateSideboardPlans(deck.id, remaining);
                                  onPlanAdded({ ...deck, sideboard_plans: remaining });
                                },
                              },
                            ],
                          );
                        }}
                      >
                        <Trash2 size={14} color="#F87171" />
                      </Pressable>
                    </ThemedView>
                  </Pressable>
                ))
              )}

              {/* Indented add button — prompts for a name before creating */}
              <Pressable style={styles.addPlanRow} onPress={() => setShowNamePrompt(true)}>
                <Plus size={14} color="#E78D17" />
                <ThemedText themeColor="textSecondary">Add sideboard plan</ThemedText>
              </Pressable>
            </ThemedView>
          </Animated.View>
        )}
      </ThemedView>

      <NamePromptModal
        visible={showNamePrompt}
        title="New Sideboard Plan"
        placeholder="e.g. vs Aggro, vs Control…"
        confirmLabel="Create"
        onClose={() => setShowNamePrompt(false)}
        onConfirm={createPlan}
      />

      <NamePromptModal
        visible={!!planToRename}
        title="Rename Plan"
        placeholder="e.g. vs Aggro, vs Control…"
        initialValue={planToRename?.vs ?? ""}
        confirmLabel="Save"
        onClose={() => setPlanToRename(null)}
        onConfirm={async (name) => {
          if (!planToRename) return;
          const updated = plans.map((p) =>
            p.id === planToRename.id ? { ...p, vs: name } : p,
          );
          await updateSideboardPlans(deck.id, updated);
          onPlanAdded({ ...deck, sideboard_plans: updated });
          setPlanToRename(null);
        }}
      />
    </>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function SideboardIndexScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [decks, setDecks] = useState<Deck[]>([]);
  const [showImport, setShowImport] = useState(false);
  // When non-null, ImportDeckModal opens in edit mode for this deck
  const [deckToEdit, setDeckToEdit] = useState<Deck | undefined>(undefined);
  // When non-null, ExportPlansModal opens for this deck
  const [exportDeck, setExportDeck] = useState<Deck | null>(null);
  // Opponent-legend name → art URL, for the "siding against" thumbnails
  const [legendImages, setLegendImages] = useState<Record<string, string>>({});

  const refreshDecks = () => loadDecks().then(setDecks);

  // Merge base-name and full-version image maps so both new plans (which store a
  // full printing name) and older plans (which stored the base hero name) resolve.
  useEffect(() => {
    Promise.all([
      RiftAPI.getLegendImages(),
      RiftAPI.getLegendVersionImages(),
    ]).then(([base, versions]) => setLegendImages({ ...base, ...versions }));
  }, []);

  // useFocusEffect re-runs every time this screen comes into focus.
  // useEffect([]) only fires on first mount, so navigating away and back
  // (e.g. after importing from the dashboard) would not refresh the list.
  useFocusEffect(
    useCallback(() => {
      refreshDecks();
    }, []),
  );

  const updateDeckInList = (updated: Deck) =>
    setDecks((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

  return (
    <>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== "web" && { paddingBottom: insets.bottom },
          ]}
        >
          <ThemedView style={styles.container}>
            {/* Import Deck — pinned at the top of the list */}
            <Pressable
              style={({ pressed }) => [styles.importBtn, pressed && { opacity: 0.7 }]}
              onPress={() => {
                setDeckToEdit(undefined); // import mode (not edit)
                setShowImport(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Import a deck"
            >
              <CirclePlus size={20} color="#E78D17" />
              <ThemedText themeColor="textSecondary">Import Deck</ThemedText>
            </Pressable>

            {decks.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                No decks yet — import one above.
              </ThemedText>
            ) : (
              decks.map((deck) => (
                <DeckRow
                  key={deck.id}
                  deck={deck}
                  legendImages={legendImages}
                  onPlanAdded={updateDeckInList}
                  onEditDeck={(d) => {
                    setDeckToEdit(d);
                    setShowImport(true);
                  }}
                  onExportDeck={(d) => setExportDeck(d)}
                  onDeleteDeck={(d) => {
                    Alert.alert(
                      "Delete Deck",
                      `Delete "${d.name}"? This will also remove all its sideboard plans and cannot be undone.`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            await deleteDeck(d.id);
                            setDecks((prev) => prev.filter((x) => x.id !== d.id));
                          },
                        },
                      ],
                    );
                  }}
                />
              ))
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>

      {/* Shared modal handles both new-import and edit-existing.
          deckToEdit=undefined → import mode; deckToEdit=Deck → edit mode */}
      <ImportDeckModal
        visible={showImport}
        deckToEdit={deckToEdit}
        onClose={() => {
          setShowImport(false);
          setDeckToEdit(undefined);
        }}
        onImported={() => {
          refreshDecks();
          setDeckToEdit(undefined);
        }}
      />

      {/* Deck-level export — select plans, preview, then export as PDF or image */}
      <ExportPlansModal
        visible={exportDeck !== null}
        deck={exportDeck}
        onClose={() => setExportDeck(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingVertical: Spacing.three,
    ...ContentLayout,
  },
  emptyText: { textAlign: "center", marginTop: Spacing.six },

  // Deck card
  deckCard: {
    borderWidth: 1,
    borderColor: "#1C5E78",
    borderRadius: 12,
    marginBottom: Spacing.two,
    overflow: "hidden",
    backgroundColor: "#0A4A63",
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  deckHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: "transparent",
    flex: 1,
  },
  deckName: { flexShrink: 1 },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#013952",
    borderWidth: 1,
    borderColor: "#1C5E78",
  },
  coverFallback: { backgroundColor: "#013952" },
  deckHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "transparent",
  },

  // Plans inside expanded deck
  plansContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#1C5E78",
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
    backgroundColor: "transparent",
  },
  noPlansText: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
  planRow: {
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C5E78",
  },
  planRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "transparent",
  },
  planMeta: { fontSize: 13, marginTop: 2 },
  oppThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#013952",
    borderWidth: 1,
    borderColor: "#1C5E78",
  },
  searchInput: {
    marginHorizontal: Spacing.five,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#013952",
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#1C5E78",
    color: "#FFFFFF",
  },

  // Indented add-plan row
  addPlanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: 48,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    marginTop: 2,
  },

  // Top import button
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    minHeight: 52,
    marginBottom: Spacing.three,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: "#1C5E78",
    borderRadius: 12,
    backgroundColor: "#0A4A63",
  },
});
