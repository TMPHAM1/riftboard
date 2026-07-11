import { Alert, Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ImportDeckModal from "@/components/ui/ImportDeckModal";
import { BottomTabInset, ContentLayout, Spacing } from "@/constants/theme";
import { RiftAPI } from "@/api/riftApi";
import { deleteDeck, loadDecks } from "@/services/deckStorageService";
import { deckCoverUrl } from "@/utils/deckImage";
import { Deck } from "@/types/rift";
import { useTheme } from "@/hooks/use-theme";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, CirclePlus, LayoutDashboard, Trash2 } from "lucide-react-native";

// Time-of-day greeting for a warmer, more personal header.
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Compact "time ago" for the last-updated line.
function relativeTime(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor(Math.max(0, Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function DashboardScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  const router = useRouter();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [legendImages, setLegendImages] = useState<Record<string, string>>({});

  const refreshDecks = () => loadDecks().then(setDecks);

  // Merge base-name + full-version image maps so any stored vsLegend resolves.
  useEffect(() => {
    Promise.all([
      RiftAPI.getLegendImages(),
      RiftAPI.getLegendVersionImages(),
    ]).then(([base, versions]) => setLegendImages({ ...base, ...versions }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshDecks();
    }, []),
  );

  const contentPlatformStyle = Platform.select({
    android: { paddingTop: insets.top, paddingBottom: insets.bottom },
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
    default: { paddingTop: insets.top, paddingBottom: insets.bottom },
  });

  // Most-recently-updated first.
  const sortedDecks = [...decks].sort((a, b) =>
    (b.updated_at ?? "").localeCompare(a.updated_at ?? ""),
  );
  const latestDeck = sortedDecks[0];

  // Distinct opponents you've built plans against → where to jump to.
  // Plans of the most-recent deck, newest-first (plan ids are `plan-<timestamp>`).
  const recentPlans = latestDeck
    ? [...(latestDeck.sideboard_plans ?? [])].sort((a, b) =>
        b.id.localeCompare(a.id),
      )
    : [];

  const openPlan = (deckId: string, planId: string) =>
    router.push({ pathname: "/sideboard/[planId]", params: { planId, deckId } });

  const openDeckSideboards = (deck: Deck) => {
    const firstPlan = deck.sideboard_plans?.[0];
    if (firstPlan) {
      router.push({
        pathname: "/sideboard/[planId]",
        params: { planId: firstPlan.id, deckId: deck.id },
      });
    } else {
      router.push("/sideboard");
    }
  };

  const handleDelete = (deck: Deck) => {
    Alert.alert("Delete Deck", `Remove "${deck.name}" from local storage?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDeck(deck.id);
          refreshDecks();
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          {/* Greeting */}
          <ThemedView>
            <ThemedText type="subtitle" style={styles.greeting}>
              {greeting()}
            </ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              Let&apos;s get your sideboards ready.
            </ThemedText>
          </ThemedView>

          {/* Jump back in */}
          {latestDeck ? (
            <Pressable
              style={({ pressed }) => [styles.jumpCard, pressed && styles.pressed]}
              onPress={() => openDeckSideboards(latestDeck)}
              accessibilityRole="button"
              accessibilityLabel={`Jump back into ${latestDeck.name}`}
            >
              {deckCoverUrl(latestDeck) ? (
                <Image
                  source={{ uri: deckCoverUrl(latestDeck) }}
                  style={styles.jumpCover}
                  contentFit="contain"
                />
              ) : (
                <ThemedView style={styles.jumpCover} />
              )}
              <ThemedView style={styles.jumpBody}>
                <ThemedText themeColor="textSecondary" style={styles.eyebrow}>
                  JUMP BACK IN
                </ThemedText>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {latestDeck.name}
                </ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                  {(latestDeck.sideboard_plans ?? []).length} plans
                  {relativeTime(latestDeck.updated_at)
                    ? ` · updated ${relativeTime(latestDeck.updated_at)}`
                    : ""}
                </ThemedText>
              </ThemedView>
              <ChevronRight size={20} color="#B3C9D1" />
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.jumpCardEmpty, pressed && styles.pressed]}
              onPress={() => setShowImport(true)}
              accessibilityRole="button"
              accessibilityLabel="Import your first deck"
            >
              <CirclePlus size={22} color={theme.accent} />
              <ThemedText type="smallBold" style={styles.jumpEmptyText}>
                Import your first deck to get started
              </ThemedText>
            </Pressable>
          )}

          {/* Quick actions */}
          <ThemedView style={styles.row}>
            <Pressable
              style={({ pressed }) => [styles.quickstartButton, pressed && styles.pressed]}
              onPress={() => setShowImport(true)}
              accessibilityRole="button"
              accessibilityLabel="Import a deck"
            >
              <CirclePlus size={24} color={theme.accent} />
              <ThemedText type="small" style={styles.quickLabel}>Import Deck</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickstartButton, pressed && styles.pressed]}
              onPress={() => router.push("/sideboard")}
              accessibilityRole="button"
              accessibilityLabel="Manage sideboards"
            >
              <LayoutDashboard size={24} color={theme.accent} />
              <ThemedText type="small" style={styles.quickLabel}>Manage Sideboard</ThemedText>
            </Pressable>
          </ThemedView>

          {/* Recent sideboards — quick access to the current deck's plans */}
          {latestDeck && recentPlans.length > 0 && (
            <ThemedView>
              <ThemedText type="smallBold" style={styles.sectionHeader} numberOfLines={1}>
                Recent Sideboards · {latestDeck.name}
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.matchupsRow}
              >
                {recentPlans.map((plan) => {
                  const thumb =
                    (plan.vsLegend && legendImages[plan.vsLegend]) ||
                    deckCoverUrl(latestDeck);
                  return (
                    <Pressable
                      key={plan.id}
                      style={styles.matchupChip}
                      onPress={() => openPlan(latestDeck.id, plan.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open plan ${plan.vs}`}
                    >
                      {thumb ? (
                        <Image
                          source={{ uri: thumb }}
                          style={styles.matchupThumb}
                          contentFit="contain"
                        />
                      ) : (
                        <ThemedView style={styles.matchupThumb} />
                      )}
                      <ThemedText type="small" numberOfLines={1} style={styles.matchupName}>
                        {plan.vs}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </ThemedView>
          )}

          {/* Recent Decks — swipe horizontally; View all opens the full list */}
          <ThemedView>
            <ThemedView style={styles.sectionHeaderRow}>
              <ThemedText type="smallBold">Recent Decks</ThemedText>
              {sortedDecks.length > 0 && (
                <Pressable
                  onPress={() => router.push("/sideboard")}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="View all decks"
                >
                  <ThemedText themeColor="textSecondary" type="small">View all ›</ThemedText>
                </Pressable>
              )}
            </ThemedView>
            {sortedDecks.length === 0 ? (
              <ThemedText themeColor="textSecondary" type="small">
                No decks yet — tap Import Deck to get started.
              </ThemedText>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.deckCardsRow}
              >
                {sortedDecks.map((deck) => (
                  <Pressable
                    key={deck.id}
                    style={styles.deckCard}
                    onPress={() => openDeckSideboards(deck)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${deck.name}`}
                  >
                    <ThemedView style={styles.deckCardCoverWrap}>
                      {deckCoverUrl(deck) ? (
                        <Image
                          source={{ uri: deckCoverUrl(deck) }}
                          style={styles.deckCardCover}
                          contentFit="contain"
                        />
                      ) : (
                        <ThemedView style={styles.deckCardCover} />
                      )}
                      <Pressable
                        style={styles.deckCardDelete}
                        hitSlop={8}
                        onPress={() => handleDelete(deck)}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${deck.name}`}
                      >
                        <Trash2 size={14} color="#FFFFFF" />
                      </Pressable>
                    </ThemedView>
                    <ThemedText type="small" numberOfLines={1} style={styles.deckCardName}>
                      {deck.name}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.deckCardMeta}>
                      {(deck.sideboard_plans ?? []).length} plans
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </ThemedView>

        </ThemedView>
      </ScrollView>

      <ImportDeckModal
        visible={showImport}
        onClose={() => setShowImport(false)}
        onImported={() => refreshDecks()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, flexDirection: "column" },
  contentContainer: { flexDirection: "row", justifyContent: "center" },
  container: {
    flexGrow: 1,
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    ...ContentLayout,
  },
  greeting: { fontSize: 26, lineHeight: 32, paddingTop: Spacing.two },

  // Jump back in
  jumpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "#E78D17",
    borderRadius: 12,
    backgroundColor: "#0A4A63",
  },
  jumpCover: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#013952",
    borderWidth: 1,
    borderColor: "#1C5E78",
  },
  jumpBody: { flex: 1, backgroundColor: "transparent", gap: 1 },
  eyebrow: { fontSize: 11, letterSpacing: 0.8, fontWeight: "700" },
  jumpCardEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: 64,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: "#E78D17",
    borderRadius: 12,
    backgroundColor: "#0A4A63",
  },
  jumpEmptyText: { flex: 1 },

  // Quick actions
  row: { flexDirection: "row", gap: Spacing.two },
  quickstartButton: {
    flex: 1,
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    borderWidth: 1,
    borderColor: "#1C5E78",
    borderRadius: 12,
    backgroundColor: "#0A4A63",
  },
  quickLabel: { textAlign: "center" },
  pressed: { opacity: 0.7 },

  // Matchups
  matchupsRow: { gap: Spacing.two, paddingVertical: Spacing.one },
  matchupChip: { width: 64, alignItems: "center", gap: 4 },
  matchupThumb: {
    width: 60,
    height: 84,
    borderRadius: 8,
    backgroundColor: "#013952",
    borderWidth: 1,
    borderColor: "#1C5E78",
  },
  matchupName: { fontSize: 12, textAlign: "center", width: 64 },

  // Cards / sections
  sectionHeader: { marginBottom: Spacing.one },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.one,
    backgroundColor: "transparent",
  },
  // Recent decks (horizontal cards)
  deckCardsRow: { gap: Spacing.two, paddingVertical: Spacing.one },
  deckCard: {
    width: 132,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: "#1C5E78",
    borderRadius: 12,
    backgroundColor: "#0A4A63",
    gap: 2,
  },
  deckCardCoverWrap: { width: "100%" },
  deckCardCover: {
    width: "100%",
    height: 92,
    borderRadius: 8,
    backgroundColor: "#013952",
    borderWidth: 1,
    borderColor: "#1C5E78",
  },
  deckCardDelete: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(1,57,82,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  deckCardName: { marginTop: 4 },
  deckCardMeta: { fontSize: 12 },
});
