import { Platform, ScrollView, StyleSheet, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ImportDeckModal from "@/components/ui/ImportDeckModal";
import { BottomTabInset, ContentLayout, Spacing } from "@/constants/theme";
import { deleteDeck, loadDecks } from "@/services/deckStorageService";
import { Deck } from "@/types/rift";
import { useTheme } from "@/hooks/use-theme";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { CirclePlus, LayoutDashboard, PanelRightClose, Trash2 } from "lucide-react-native";

export default function DashboardScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [showImport, setShowImport] = useState(false);

  const refreshDecks = () => loadDecks().then(setDecks);

  // useFocusEffect re-runs whenever this screen is focused.
  // This means the deck list stays in sync even if a deck was imported
  // or deleted while on another tab — no stale data on return.
  useFocusEffect(
    useCallback(() => {
      refreshDecks();
    }, []),
  );

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  const handleDelete = (deck: Deck) => {
    Alert.alert(
      "Delete Deck",
      `Remove "${deck.name}" from local storage?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteDeck(deck.id);
            refreshDecks();
          },
        },
      ],
    );
  };

  return (
    <>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      >
        <ThemedView style={styles.container}>
          {/* Title */}
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.centerText}>Get Started</ThemedText>
          </ThemedView>

          {/* Quick Start Row */}
          <ThemedView style={styles.row}>
            <Pressable style={styles.quickstartButton} onPress={() => setShowImport(true)}>
              <CirclePlus style={{ marginTop: "auto", marginHorizontal: "auto" }} />
              <ThemedText style={styles.centerText}>Import Deck</ThemedText>
            </Pressable>
            <ThemedView style={styles.quickstartButton}>
              <LayoutDashboard style={{ marginTop: "auto", marginHorizontal: "auto" }} />
              <ThemedText style={styles.centerText}>Manage Sideboard</ThemedText>
            </ThemedView>
            <ThemedView style={styles.quickstartButton}>
              <PanelRightClose style={{ marginTop: "auto", marginHorizontal: "auto" }} />
              <ThemedText style={styles.centerText}>Sideboard Performance</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Recent Decks */}
          <ThemedView style={styles.recentDecksContainer}>
            <ThemedText>Recent Decks</ThemedText>
            {decks.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={{ marginTop: 8 }}>
                No decks yet — tap Import Deck to get started.
              </ThemedText>
            ) : (
              decks.map((deck) => (
                <ThemedView key={deck.id} style={styles.deckRow}>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText type="smallBold">{deck.name}</ThemedText>
                    <ThemedText themeColor="textSecondary">
                      {deck.total_cards} cards · {(deck.sideboard_plans ?? []).length} sideboard plans
                    </ThemedText>
                  </ThemedView>
                  <Pressable hitSlop={8} onPress={() => handleDelete(deck)}>
                    <Trash2 size={18} color="#A32D2D" />
                  </Pressable>
                </ThemedView>
              ))
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
  scrollView: {
    flex: 1,
    flexDirection: "column",
  },
  centerText: {
    textAlign: "center",
    marginTop: "auto",
    marginBottom: "auto",
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    flexGrow: 1,
    ...ContentLayout,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 5,
  },
  quickstartButton: {
    width: "30%",
    minHeight: 150,
    flexDirection: "column",
    borderWidth: 2,
    borderColor: "black",
    alignContent: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  recentDecksContainer: {
    paddingVertical: 16,
    marginVertical: 10,
    paddingLeft: 12,
    paddingRight: 12,
    borderColor: "black",
    borderWidth: 2,
    gap: 8,
  },
  deckRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
  },
});
