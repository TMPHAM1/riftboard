import { Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { dummyDeckList } from "@/data/mockDeckData";
import { useTheme } from "@/hooks/use-theme";
import {
  CirclePlus,
  LayoutDashboard,
  PanelRightClose,
} from "lucide-react-native";

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

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

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        {/* Title  */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={styles.centerText}>Get Started</ThemedText>
        </ThemedView>
        {/* Quick Start Row */}
        <ThemedView style={styles.row}>
          <ThemedView style={styles["quickstart-button"]}>
            <CirclePlus
              style={{ marginTop: "auto", marginHorizontal: "auto" }}
            />
            <ThemedText style={styles.centerText}>Create Deck</ThemedText>
          </ThemedView>
          <ThemedView style={styles["quickstart-button"]}>
            <LayoutDashboard
              style={{ marginTop: "auto", marginHorizontal: "auto" }}
            />
            <ThemedText style={styles.centerText}>Manage Sideboard</ThemedText>
          </ThemedView>
          <ThemedView style={styles["quickstart-button"]}>
            <PanelRightClose
              style={{ marginTop: "auto", marginHorizontal: "auto" }}
            />

            <ThemedText style={styles.centerText}>
              Sideboard Performance
            </ThemedText>
          </ThemedView>
        </ThemedView>
        {/* Recent Decks row */}
        <ThemedView style={styles.recentDecksContainer}>
          {/* Recent Deck Title */}
          <ThemedText>Recent Decks</ThemedText>
          {/* Recent Deck Row  */}
          <ThemedView>
            {dummyDeckList.map((deck) => (
              <ThemedView key={deck.id}>
                <ThemedText>{deck.name}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
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
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    marginHorizontal: 10,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: "center",
    gap: Spacing.one,
    alignItems: "center",
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: "center",
  },
  imageTutorial: {
    width: "100%",
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-around",
    gap: 5,
  },
  recentDecksContainer: {
    paddingVertical: 20,
    marginVertical: 10,
    paddingLeft: 5,
    borderColor: "black",
    boxShadow: "10 20 10 10",
    borderWidth: 2,
  },
  "quickstart-button": {
    width: "30%",
    minHeight: 150,
    flexDirection: "column",
    display: "flex",
    borderWidth: 2,
    borderColor: "black",
    alignContent: "center",
    justifyContent: "center",
    textAlign: "center",
  },
});
