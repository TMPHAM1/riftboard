import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ChevronRight, FileText, Shield, Trash2 } from "lucide-react-native";
import { Alert, Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DATA_SOURCE_NOTE, RIOT_DISCLAIMER } from "@/constants/legal";
import { BottomTabInset, ContentLayout, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { clearAllDecks } from "@/services/deckStorageService";

export default function SettingsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  const router = useRouter();

  const version = Constants.expoConfig?.version ?? "1.0.0";

  const contentPlatformStyle = Platform.select({
    android: { paddingTop: insets.top, paddingBottom: insets.bottom },
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
    default: { paddingTop: insets.top, paddingBottom: insets.bottom },
  });

  const confirmClear = () =>
    Alert.alert(
      "Clear local data",
      "This permanently removes all decks and sideboard plans stored on this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => clearAllDecks(),
        },
      ],
    );

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.pageTitle}>
          Settings
        </ThemedText>

        {/* About */}
        <ThemedView style={styles.card}>
          <ThemedText type="smallBold">Riftboard</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Deck & sideboard companion for Riftbound.
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small" style={styles.version}>
            Version {version}
          </ThemedText>
        </ThemedView>

        {/* Legal links */}
        <ThemedView style={styles.card}>
          <Pressable
            style={styles.row}
            onPress={() => router.push("/legal/privacy")}
            accessibilityRole="button"
            accessibilityLabel="Open Privacy Policy"
          >
            <Shield size={18} color="#B3C9D1" />
            <ThemedText type="small" style={styles.rowLabel}>Privacy Policy</ThemedText>
            <ChevronRight size={18} color="#7FA3B0" />
          </Pressable>
          <ThemedView style={styles.divider} />
          <Pressable
            style={styles.row}
            onPress={() => router.push("/legal/terms")}
            accessibilityRole="button"
            accessibilityLabel="Open Terms of Use"
          >
            <FileText size={18} color="#B3C9D1" />
            <ThemedText type="small" style={styles.rowLabel}>Terms of Use</ThemedText>
            <ChevronRight size={18} color="#7FA3B0" />
          </Pressable>
        </ThemedView>

        {/* Data & attribution */}
        <ThemedView style={styles.card}>
          <ThemedText type="smallBold" style={styles.cardHeading}>Data</ThemedText>
          <ThemedText themeColor="textSecondary" type="small" style={styles.body}>
            Your decks and sideboard plans are stored only on this device — nothing
            is uploaded, and Riftboard collects no personal data.
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small" style={styles.body}>
            {DATA_SOURCE_NOTE}
          </ThemedText>
        </ThemedView>

        {/* Riot fan-project disclaimer */}
        <ThemedView style={styles.card}>
          <ThemedText themeColor="textSecondary" type="small" style={styles.disclaimer}>
            {RIOT_DISCLAIMER}
          </ThemedText>
        </ThemedView>

        {/* Clear local data */}
        <Pressable
          style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
          onPress={confirmClear}
          accessibilityRole="button"
          accessibilityLabel="Clear local data"
        >
          <Trash2 size={16} color="#F87171" />
          <ThemedText type="small" style={styles.clearText}>Clear local data</ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    flexGrow: 1,
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    ...ContentLayout,
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 32,
    paddingTop: Spacing.two,
  },
  card: {
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "#1C5E78",
    borderRadius: 12,
    backgroundColor: "#0A4A63",
    gap: Spacing.one,
  },
  cardHeading: { marginBottom: Spacing.one },
  version: { marginTop: Spacing.one },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: 48,
    backgroundColor: "transparent",
  },
  rowLabel: { flex: 1 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#1C5E78",
  },
  body: { lineHeight: 20 },
  disclaimer: { lineHeight: 20, fontStyle: "italic" },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#F87171",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  clearText: { color: "#F87171", fontWeight: "600" },
});
