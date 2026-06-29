import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppDropdown, { DropdownOption } from "@/components/ui/AppDropdown";
import CardPreviewModal from "@/components/ui/CardPreviewModal";
import ImportDeckModal from "@/components/ui/ImportDeckModal";
import NamePromptModal from "@/components/ui/NamePromptModal";
import RowMenu from "@/components/ui/RowMenu";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { RiftAPI } from "@/api/riftApi";
import { slotsTotal } from "@/data/mockDeckData";
import { loadDecks, updateSideboardPlans } from "@/services/deckStorageService";
import { CardSlot, Deck, RiftCard, SideBoardPlan } from "@/types/rift";
import { useLocalSearchParams } from "expo-router";
import PlanExportView from "@/components/ui/PlanExportView";
import * as Sharing from "expo-sharing";
import { AlertTriangle, Pencil, PlusCircle, PlusSquare, Share2 } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const EMPTY_PLAN: SideBoardPlan = { id: "", vs: "", out: [], in: [] };

export default function SideBoardPlanScreen() {
  type SideKey = "in" | "out";

  const { planId, deckId } = useLocalSearchParams<{
    planId: string;
    deckId: string;
  }>();

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [decks, setDecks] = useState<Deck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SideBoardPlan>(EMPTY_PLAN);
  const [previewCard, setPreviewCard] = useState<RiftCard | null>(null);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [legends, setLegends] = useState<string[]>([]);
  const exportRef = useRef<View>(null);

  const handleExport = async () => {
    if (!exportRef.current || !currentDeck) return;
    setIsExporting(true);
    try {
      const uri = await captureRef(exportRef, { format: "png", quality: 1 });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share sideboard plan",
      });
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch legend names from the API once on mount (cached in-memory after first call)
  useEffect(() => {
    RiftAPI.getLegends().then(setLegends);
  }, []);

  // Load decks from storage on mount
  useEffect(() => {
    loadDecks().then((loaded) => {
      setDecks(loaded);
      const target = loaded.find((d) => d.id === deckId) ?? loaded[0] ?? null;
      if (!target) return;
      setCurrentDeck(target);
      const plan =
        target.sideboard_plans?.find((p) => p.id === planId) ??
        target.sideboard_plans?.[0] ??
        EMPTY_PLAN;
      setCurrentPlan(plan);
    });
  }, [deckId, planId]);

  // Persist plan changes to storage
  const persistPlan = async (deck: Deck, updatedPlan: SideBoardPlan) => {
    const plans = (deck.sideboard_plans ?? []).map((p) =>
      p.id === updatedPlan.id ? updatedPlan : p,
    );
    await updateSideboardPlans(deck.id, plans);
  };

  // Dropdown options
  const deckOptions: DropdownOption[] = decks.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const plans = currentDeck?.sideboard_plans ?? [];
  const planOptions: DropdownOption[] = plans.map((p) => ({
    label: p.vs || p.id,
    value: p.id,
  }));

  const mainDeck = currentDeck?.main_deck ?? [];
  const sideboard = currentDeck?.sideboard ?? [];

  // Include card data on each option so AppDropdown can render stats inline
  const mainBoardOptions: DropdownOption[] = mainDeck
    .filter((c) => !currentPlan.out.some((s) => s.cardId === c.card_name))
    .map((c) => ({ label: c.card_name, value: c.card_name, card: c.card_data }));

  const sideBoardOptions: DropdownOption[] = sideboard
    .filter((c) => !currentPlan.in.some((s) => s.cardId === c.card_name))
    .map((c) => ({ label: c.card_name, value: c.card_name, card: c.card_data }));

  const quantityOptions = (max: number): DropdownOption[] =>
    Array.from({ length: Math.max(max, 1) }, (_, i) => ({
      label: `${i + 1}`,
      value: i + 1,
    }));

  const updateSlot = (
    sideType: SideKey,
    index: number,
    changes: Partial<CardSlot>,
  ) => {
    const updated: SideBoardPlan = {
      ...currentPlan,
      [sideType]: currentPlan[sideType].map((s, i) =>
        i === index ? { ...s, ...changes } : s,
      ),
    };
    setCurrentPlan(updated);
    if (currentDeck) persistPlan(currentDeck, updated);
  };

  const deleteSlot = (sideType: SideKey, index: number) => {
    const updated: SideBoardPlan = {
      ...currentPlan,
      [sideType]: currentPlan[sideType].filter((_, i) => i !== index),
    };
    setCurrentPlan(updated);
    if (currentDeck) persistPlan(currentDeck, updated);
  };

  const addSlot = (sideType: SideKey) => {
    const updated: SideBoardPlan = {
      ...currentPlan,
      [sideType]: [...currentPlan[sideType], { cardId: "", quantity: 1 }],
    };
    setCurrentPlan(updated);
    if (currentDeck) persistPlan(currentDeck, updated);
  };

  const resolveCard = (
    cardId: string,
    pool: typeof mainDeck,
  ): RiftCard | null =>
    pool.find((d) => d.card_name === cardId)?.card_data ?? null;

  const outTotal = slotsTotal(currentPlan.out);
  const inTotal = slotsTotal(currentPlan.in);

  const planWarnings: string[] = [];
  const hasSlots = currentPlan.out.length > 0 || currentPlan.in.length > 0;
  if (hasSlots) {
    if (currentPlan.out.some((s) => !s.cardId) || currentPlan.in.some((s) => !s.cardId))
      planWarnings.push("Some slots have no card selected — fill or remove them.");
    if (outTotal > 8) planWarnings.push("Side Out exceeds 8 cards.");
    if (inTotal > 8) planWarnings.push("Side In exceeds 8 cards.");
    if (outTotal !== inTotal)
      planWarnings.push(`Side Out (${outTotal}) and Side In (${inTotal}) totals don't match — they must be equal.`);
  }

  if (!currentDeck) {
    return (
      <SafeAreaView edges={["top", "bottom"]}>
        <ThemedView style={styles.container}>
          <ThemedText>Loading…</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Deck selector — edit updates current deck, plus imports a new one */}
        <ThemedView style={styles.selectorBlock}>
          <ThemedView style={styles.labelRow}>
            <ThemedText>Deck</ThemedText>
            <ThemedView style={styles.labelActions}>
              <Pressable hitSlop={10} onPress={() => setShowEditDeck(true)}>
                <Pencil size={16} color="#888" />
              </Pressable>
              <Pressable hitSlop={10} onPress={() => setShowNewDeck(true)}>
                <PlusCircle size={16} color="#888" />
              </Pressable>
            </ThemedView>
          </ThemedView>
          <AppDropdown
            options={[
              ...deckOptions,
              { label: "+ Add new deck", value: "__new_deck__" },
            ]}
            value={currentDeck.id}
            onChange={(id) => {
              if (id === "__new_deck__") {
                setShowNewDeck(true);
                return;
              }
              const selected = decks.find((d) => d.id === id);
              if (!selected) return;
              setCurrentDeck(selected);
              setCurrentPlan(selected.sideboard_plans?.[0] ?? EMPTY_PLAN);
            }}
          />
        </ThemedView>

        {/* Sideboard plan selector — dropdown + rename + delete inline to the right */}
        <ThemedView style={styles.selectorBlock}>
          <ThemedView style={styles.labelRow}>
            <ThemedText>Sideboard Plan</ThemedText>
            <ThemedView style={styles.labelActions}>
              {currentPlan.id && (
                <Pressable hitSlop={10} onPress={handleExport} disabled={isExporting}>
                  <Share2 size={16} color={isExporting ? "#ccc" : "#888"} />
                </Pressable>
              )}
              <Pressable hitSlop={10} onPress={() => setShowNamePrompt(true)}>
                <PlusCircle size={18} color="#888" />
              </Pressable>
            </ThemedView>
          </ThemedView>
          <AppDropdown
            options={[
              ...planOptions,
              { label: "+ Add new sideboard plan", value: "__new__" },
            ]}
            value={currentPlan.id || null}
            onChange={(id) => {
              if (id === "__new__") {
                setShowNamePrompt(true);
                return;
              }
              const selected = plans.find((p) => p.id === id);
              if (selected) setCurrentPlan(selected);
            }}
          />
        </ThemedView>

        {/* Opponent's legend — optional, fetched live from RiftCodex API */}
        {currentPlan.id && (
          <ThemedView style={styles.selectorBlock}>
            <ThemedText>Opponent's Legend (optional)</ThemedText>
            <AppDropdown
              placeholder="Select opponent's legend…"
              options={[
                { label: "None", value: "" },
                ...legends.map((l) => ({ label: l, value: l })),
              ]}
              value={currentPlan.vsLegend ?? ""}
              onChange={(val) => {
                const updated = { ...currentPlan, vsLegend: val || undefined };
                setCurrentPlan(updated);
                persistPlan(currentDeck, updated);
              }}
            />
          </ThemedView>
        )}

        {/* Side Out */}
        <ThemedView>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText>Side Out</ThemedText>
            <ThemedText style={outTotal > 8 ? styles.countWarning : undefined}>
              {outTotal}/8
            </ThemedText>
          </ThemedView>

          {currentPlan.out.map((slot, index) => {
            const deckCard = mainDeck.find((d) => d.card_name === slot.cardId);
            const max = deckCard?.quantity ?? 3;
            const cardData = resolveCard(slot.cardId, mainDeck);
            return (
              <ThemedView style={styles.row} key={index}>
                <AppDropdown
                  value={slot.quantity || 1}
                  onChange={(qty) =>
                    updateSlot("out", index, { quantity: parseInt(qty) })
                  }
                  options={quantityOptions(max)}
                  propStyles={{ maxWidth: 70 }}
                  disableSearch={true}
                />
                <AppDropdown
                  value={slot.cardId || null}
                  onChange={(cardId) => updateSlot("out", index, { cardId, quantity: 1 })}
                  options={[
                    ...(slot.cardId
                      ? [{ label: slot.cardId, value: slot.cardId, card: resolveCard(slot.cardId, mainDeck) ?? undefined }]
                      : []),
                    ...mainBoardOptions.filter((o) => o.value !== slot.cardId),
                  ]}
                />
                <RowMenu
                  onDelete={() => deleteSlot("out", index)}
                  onView={cardData ? () => setPreviewCard(cardData) : undefined}
                />
              </ThemedView>
            );
          })}

          {outTotal < 8 && (
            <Pressable style={styles.button} onPress={() => addSlot("out")}>
              <ThemedText>Add Card to Side Out</ThemedText>
              <PlusSquare size={24} />
            </Pressable>
          )}
        </ThemedView>

        {/* Warning banner — shown between sections when the plan has issues */}
        {planWarnings.length > 0 && (
          <Pressable style={styles.warningBanner} onPress={() => setShowWarningModal(true)}>
            <AlertTriangle size={15} color="#92400E" />
            <ThemedText style={styles.warningBannerText}>
              {planWarnings.length} issue{planWarnings.length > 1 ? "s" : ""} with this plan — tap to view
            </ThemedText>
          </Pressable>
        )}

        {/* Side In */}
        <ThemedView>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText>Side In</ThemedText>
            <ThemedText style={inTotal > 8 ? styles.countWarning : undefined}>
              {inTotal}/8
            </ThemedText>
          </ThemedView>

          {currentPlan.in.map((slot, index) => {
            const deckCard = sideboard.find((d) => d.card_name === slot.cardId);
            const max = deckCard?.quantity ?? 3;
            const cardData = resolveCard(slot.cardId, sideboard);
            return (
              <ThemedView style={styles.row} key={index}>
                <AppDropdown
                  value={slot.quantity || 1}
                  onChange={(qty) =>
                    updateSlot("in", index, { quantity: parseInt(qty) })
                  }
                  options={quantityOptions(max)}
                  propStyles={{ maxWidth: 70 }}
                  disableSearch={true}
                />
                <AppDropdown
                  value={slot.cardId || null}
                  onChange={(cardId) => updateSlot("in", index, { cardId, quantity: 1 })}
                  options={[
                    ...(slot.cardId
                      ? [{ label: slot.cardId, value: slot.cardId, card: resolveCard(slot.cardId, sideboard) ?? undefined }]
                      : []),
                    ...sideBoardOptions.filter((o) => o.value !== slot.cardId),
                  ]}
                />
                <RowMenu
                  onDelete={() => deleteSlot("in", index)}
                  onView={cardData ? () => setPreviewCard(cardData) : undefined}
                />
              </ThemedView>
            );
          })}

          {inTotal < 8 && (
            <Pressable style={styles.button} onPress={() => addSlot("in")}>
              <ThemedText>Add Card to Side In</ThemedText>
              <PlusSquare size={24} />
            </Pressable>
          )}
        </ThemedView>
      </ScrollView>

      <CardPreviewModal
        card={previewCard}
        visible={!!previewCard}
        onClose={() => setPreviewCard(null)}
      />

      <Modal
        visible={showWarningModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWarningModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowWarningModal(false)}>
          <ThemedView style={styles.warningSheet}>
            <ThemedText type="smallBold" style={styles.warningSheetTitle}>
              Plan Issues
            </ThemedText>
            {planWarnings.map((w, i) => (
              <ThemedView key={i} style={styles.warningItem}>
                <AlertTriangle size={14} color="#92400E" />
                <ThemedText style={styles.warningItemText}>{w}</ThemedText>
              </ThemedView>
            ))}
            <Pressable
              style={styles.warningCloseBtn}
              onPress={() => setShowWarningModal(false)}
            >
              <ThemedText style={styles.warningCloseBtnText}>Got it</ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>

      <NamePromptModal
        visible={showNamePrompt}
        title="New Sideboard Plan"
        placeholder="e.g. vs Aggro, vs Control…"
        confirmLabel="Create"
        onClose={() => setShowNamePrompt(false)}
        onConfirm={(name) => {
          const newPlan: SideBoardPlan = {
            id: `plan-${Date.now()}`,
            vs: name,
            out: [],
            in: [],
          };
          const updatedPlans = [...plans, newPlan];
          updateSideboardPlans(currentDeck.id, updatedPlans);
          setCurrentDeck({ ...currentDeck, sideboard_plans: updatedPlans });
          setCurrentPlan(newPlan);
        }}
      />

      {/* Edit — overwrites the current deck in storage */}
      <ImportDeckModal
        visible={showEditDeck}
        deckToEdit={currentDeck}
        onClose={() => setShowEditDeck(false)}
        onImported={(updated) => {
          setCurrentDeck(updated);
          loadDecks().then(setDecks);
        }}
      />

      {/* Add — imports a brand-new deck then switches to it */}
      <ImportDeckModal
        visible={showNewDeck}
        onClose={() => setShowNewDeck(false)}
        onImported={(newDeck) => {
          loadDecks().then((all) => {
            setDecks(all);
            setCurrentDeck(newDeck);
            setCurrentPlan(newDeck.sideboard_plans?.[0] ?? EMPTY_PLAN);
          });
        }}
      />

      {/* Off-screen capture target — rendered outside viewport, captured on export */}
      <View style={styles.offScreen}>
        <ViewShot>
          <View ref={exportRef}>
            <PlanExportView
              plan={currentPlan}
              deckName={currentDeck?.name ?? ""}
            />
          </View>
        </ViewShot>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  countWarning: { color: "#A32D2D" },
  selectorBlock: {
    gap: Spacing.one,
    paddingHorizontal: 10,
    marginBottom: Spacing.two,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
  button: {
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 12,
    alignItems: "center",
  },
  container: {
    ...Platform.select({
      web: { paddingHorizontal: 40, paddingVertical: Spacing.four },
      default: {
        maxWidth: MaxContentWidth,
        marginHorizontal: 10,
        paddingVertical: Spacing.two,
      },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginVertical: 4,
    paddingHorizontal: 10,
  },

  // Warning banner between Side Out and Side In
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginVertical: Spacing.two,
    marginHorizontal: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  warningBannerText: {
    color: "#92400E",
    fontSize: 13,
  },

  // Warning modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  warningSheet: {
    width: "100%",
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  warningSheetTitle: {
    fontSize: 15,
    marginBottom: Spacing.one,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 4,
  },
  warningItemText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  warningCloseBtn: {
    marginTop: Spacing.two,
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#F59E0B",
    borderRadius: 8,
  },
  warningCloseBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  offScreen: {
    position: "absolute",
    top: -9999,
    left: -9999,
    opacity: 0,
  },
});
