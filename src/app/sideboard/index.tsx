import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ImportDeckModal from "@/components/ui/ImportDeckModal";
import NamePromptModal from "@/components/ui/NamePromptModal";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { deleteDeck, loadDecks, updateSideboardPlans } from "@/services/deckStorageService";
import { Deck, SideBoardPlan } from "@/types/rift";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronDown, ChevronRight, CirclePlus, Pencil, Plus, Trash2 } from "lucide-react-native";
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
}

function DeckRow({ deck, onPlanAdded, onEditDeck, onDeleteDeck }: DeckRowProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [planToRename, setPlanToRename] = useState<SideBoardPlan | null>(null);
  const router = useRouter();
  const plans = deck.sideboard_plans ?? [];

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
              ? <ChevronDown size={18} color="#555" />
              : <ChevronRight size={18} color="#555" />}
            <ThemedText type="smallBold">{deck.name}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.deckHeaderRight}>
            <ThemedText themeColor="textSecondary">
              {plans.length} {plans.length === 1 ? "plan" : "plans"}
            </ThemedText>
            <Pressable
              hitSlop={10}
              onPress={(e) => { e.stopPropagation(); onEditDeck(deck); }}
            >
              <Pencil size={16} color="#888" />
            </Pressable>
            <Pressable
              hitSlop={10}
              onPress={(e) => {
                e.stopPropagation();
                onDeleteDeck(deck);
              }}
            >
              <Trash2 size={16} color="#A32D2D" />
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
                  placeholderTextColor="#aaa"
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
                      <ThemedView style={{ flex: 1 }}>
                        <ThemedText type="small">{plan.vs}</ThemedText>
                        {plan.vsLegend && (
                          <ThemedView style={styles.vsLegendTag}>
                            <ThemedText style={styles.vsLegendTagText}>
                              vs {plan.vsLegend}
                            </ThemedText>
                          </ThemedView>
                        )}
                        <ThemedText themeColor="textSecondary" style={styles.planMeta}>
                          {plan.out.length} out · {plan.in.length} in
                        </ThemedText>
                      </ThemedView>
                      <Pressable
                        hitSlop={10}
                        onPress={(e) => { e.stopPropagation(); setPlanToRename(plan); }}
                      >
                        <Pencil size={14} color="#888" />
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
                        <Trash2 size={14} color="#A32D2D" />
                      </Pressable>
                    </ThemedView>
                  </Pressable>
                ))
              )}

              {/* Indented add button — prompts for a name before creating */}
              <Pressable style={styles.addPlanRow} onPress={() => setShowNamePrompt(true)}>
                <Plus size={14} color="#888" />
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

  const refreshDecks = () => loadDecks().then(setDecks);

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
            {decks.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                No decks yet — import one below.
              </ThemedText>
            ) : (
              decks.map((deck) => (
                <DeckRow
                  key={deck.id}
                  deck={deck}
                  onPlanAdded={updateDeckInList}
                  onEditDeck={(d) => {
                    setDeckToEdit(d);
                    setShowImport(true);
                  }}
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

            {/* Import Deck — always pinned at the bottom */}
            <Pressable
              style={({ pressed }) => [styles.importBtn, pressed && { opacity: 0.7 }]}
              onPress={() => {
                setDeckToEdit(undefined); // import mode (not edit)
                setShowImport(true);
              }}
            >
              <CirclePlus size={20} color="#555" />
              <ThemedText themeColor="textSecondary">Import Deck</ThemedText>
            </Pressable>
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
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingVertical: Spacing.three,
    ...Platform.select({
      web: { maxWidth: 1200, marginHorizontal: "auto", paddingHorizontal: 40 },
      default: { maxWidth: MaxContentWidth, marginHorizontal: 10 },
    }),
  },
  emptyText: { textAlign: "center", marginTop: Spacing.six },

  // Deck card
  deckCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: Spacing.two,
    overflow: "hidden",
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  deckHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  deckHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  // Plans inside expanded deck
  plansContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
  },
  noPlansText: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
  planRow: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.five,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  planRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  planMeta: { fontSize: 12, marginTop: 2 },
  vsLegendTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#FEF3C7",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#F59E0B",
    marginTop: 3,
    marginBottom: 1,
  },
  vsLegendTagText: { fontSize: 11, color: "#92400E" },
  searchInput: {
    marginHorizontal: Spacing.five,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    color: "#333",
  },

  // Indented add-plan row
  addPlanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
    paddingVertical: 12,
    marginTop: 2,
  },

  // Bottom import button
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    marginTop: "auto",
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
  },
});
