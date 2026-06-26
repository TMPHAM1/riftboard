import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DropdownOption } from "@/components/ui/AppDropdown";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { dummyDeckList, SideBoardPlan } from "@/data/mockDeckData";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useRouter } from "expo-router";

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
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

  const [deck, onDeckChange] = useState(dummyDeckList[0]);
  const options: DropdownOption[] = dummyDeckList.map((deck) => ({
    label: deck.name,
    value: deck.id,
  }));
  const sideBoardPlans: SideBoardPlan[] = deck.sideBoardPlans;
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.scrollView}>
      <ThemedView style={styles.container}>
        {/* Title  */}
        <ThemedView>
          <FlatList
            data={dummyDeckList}
            renderItem={({ item, index }) => (
              <Pressable onPress={() => onDeckChange(item)}>
                <ThemedText>{item.name}</ThemedText>
                <ThemedText>{item.sideBoardPlans.length}</ThemedText>
              </Pressable>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={250} // Adjust based on card width
            decelerationRate="fast"
          />

          <ThemedView>
            <FlatList
              data={sideBoardPlans}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.sideboardPlanContainer}
                  onPress={() =>
                    router.push({
                      pathname: "/sideboard/[planId]",
                      params: { planId: item.id, deckId: deck.id },
                    })
                  }
                >
                  <ThemedText>{item.vs}</ThemedText>
                </Pressable>
              )}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
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
    flex: 1,
    ...Platform.select({
      web: {
        width: "100%",
        maxWidth: 1200, // Or remove entirely for full width
        marginHorizontal: "auto", // Centers it
      },
      default: {
        maxWidth: MaxContentWidth,
        marginHorizontal: 10,
      },
    }),
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
  sideboardPlanContainer: {
    paddingVertical: 25,
    marginTop: 5,
    borderColor: "black",
    borderWidth: 2,
    paddingLeft: 15,
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
