import { ThemedText } from "@/components/themed-text";
import AppDropdown, { DropdownOption } from "@/components/ui/AppDropdown";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { SideBoardPlan, slotsTotal } from "@/data/mockDeckData";
import { useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { EllipsisVertical, PlusSquareIcon } from "lucide-react-native";

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  // DummyData until sideboard call is done properly
  const sideBoard = [
    { cardId: "disruptive-hex", quantity: 2 },
    { cardId: "resolute-vanguard", quantity: 2 },
    { cardId: "counter-spell", quantity: 2 },
    { cardId: "big-finish", quantity: 2 },
  ];

  const mainBoard = [
    { cardId: "vi-champ", quantity: 2 },
    { cardId: "shock-trooper", quantity: 3 },
    { cardId: "brawler", quantity: 3 },
    { cardId: "street-tough", quantity: 3 },
    { cardId: "reckless-charge", quantity: 3 },
    { cardId: "demolish", quantity: 2 },
    { cardId: "riot-instigator", quantity: 3 },
    { cardId: "chaos-bolt", quantity: 3 },
    { cardId: "enforcer-squad", quantity: 3 },
    { cardId: "overdrive", quantity: 2 },
    { cardId: "wrecking-ball", quantity: 2 },
    { cardId: "quick-jab", quantity: 3 },
    { cardId: "unstable-bruiser", quantity: 3 },
    { cardId: "heavy-hitter", quantity: 3 },
    { cardId: "last-stand", quantity: 2 },
  ];

  const dummySideBoardPlan = {
    id: "plan-vs-draven",
    vs: "Draven Aggro",
    out: [
      { cardId: "reckless-charge", quantity: 2 },
      { cardId: "brawler", quantity: 1 },
    ],
    in: [
      { cardId: "disruptive-hex", quantity: 2 },
      { cardId: "resolute-vanguard", quantity: 1 },
    ],
    swapChampionTo: "",
    notes:
      "Hex clears their small units; Vanguard holds the lane. Mulligan for 2-drops.",
  };

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

  const [currentSideBoardPlan, setCurrentSideBoardPlan] =
useState<SideBoardPlan>(dummySideBoardPlan ?? {
  id: "",
  vs: "",
  out: [],
  in: [],
  swapChampionTo: "",
  notes: "",
});  console.log("slots that are available", slotsTotal(currentSideBoardPlan.out));
  const sideBoardOptions: DropdownOption[] = sideBoard
    .filter(
      (sideBoardCard) =>
        !currentSideBoardPlan.in.some(
          (sideInCard: any) => sideInCard.id === sideBoardCard.cardId,
        ),
    )
    .map((sideBoardCard) => ({
      label: sideBoardCard.cardId,
      value: sideBoardCard.cardId,
    }));
  const mainBoardOptions: DropdownOption[] = mainBoard
    .filter(
      (mainBoardCard) =>
        !currentSideBoardPlan.out.some(
          (sideOutCard: any) => sideOutCard.id === mainBoardCard.cardId,
        ),
    )
    .map((mainBoardCard) => ({
      label: mainBoardCard.cardId,
      value: mainBoardCard.cardId,
    }));

  
  const quantityOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
  ];
  return (
    <SafeAreaView edges={["top", "bottom"]}>
      <ThemedView style={styles.container}>
        {/* THIS is where Logic for Side Boarding Cards In / Out Should be  */}
        <ThemedView>
          <ThemedView style={{display: "flex", flexDirection: "row", justifyContent:"space-between", paddingHorizontal: 10}}>
          <ThemedText>Side Out</ThemedText>
          <ThemedText>{slotsTotal(currentSideBoardPlan.out)}/8</ThemedText>
          </ThemedView>
          {currentSideBoardPlan.out.map((sideBoardCard: any, index: number) => (
            <ThemedView style={styles.row} key={index}>
              <AppDropdown
                value={sideBoardCard.quantity || 1}
                onChange={() => {}}
                options={quantityOptions}
                propStyles={{ maxWidth: 70 }}
              />
              <AppDropdown
                value={sideBoardCard.cardId || null}
                onChange={() => {}}
                options={mainBoardOptions}
              />
                      <EllipsisVertical width={24} height={24} />
            </ThemedView>
    
          ))}
          {slotsTotal(currentSideBoardPlan.out) < 8 ? (
            <Pressable  
             onPress={() => {
    setCurrentSideBoardPlan((prev) => ({
      ...prev,
      out: [...prev.out, { cardId: "", quantity: 1 }],
    }));
  }}
            >
            <PlusSquareIcon
              height={32}
              width={32}
             
            />
            </Pressable>
          ) : null}
        </ThemedView>
        <ThemedView>
          <ThemedText>Side In</ThemedText>
          {currentSideBoardPlan.out.map((sideBoardCard: any, index: number) => (
            <ThemedView style={styles.row} key={`out-${index}`}>
              <AppDropdown
                value={sideBoardCard.cardId || null}
                onChange={() => {}}
                options={sideBoardOptions}
              />
              {slotsTotal(currentSideBoardPlan.in) < 8 ? (
                <PlusSquareIcon height={32} width={32} />
              ) : null}
            </ThemedView>
          ))}
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
    alignItems: "center",
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
});
