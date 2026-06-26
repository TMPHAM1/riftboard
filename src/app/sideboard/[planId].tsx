import { ThemedText } from "@/components/themed-text";
import AppDropdown, { DropdownOption } from "@/components/ui/AppDropdown";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { dummyDeckList, SideBoardPlan, slotsTotal } from "@/data/mockDeckData";
import { useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import RowMenu from "@/components/ui/RowMenu";
import { PlusCircleIcon, PlusSquareIcon } from "lucide-react-native";

export default function SideBoardPlanScreen() {
  type SideKey = "in" | "out";
  type CardSlot = { cardId: string; quantity: number };

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  // DummyData until sideboard call is done properly

  const dummySideBoardPlan = {
    id: "plan-vs-draven",
    vs: "Draven Aggro",
    out: [
      { cardId: "reckless-charge", quantity: 2 },
      { cardId: "brawler", quantity: 1 },
    ],
    in: [],
    swapChampionTo: "",
    notes:
      "Hex clears their small units; Vanguard holds the lane. Mulligan for 2-drops.",
  };

  const deckOptions: DropdownOption[] = dummyDeckList.map((deck) => ({
    label: deck.name,
    value: deck.id,
  }));

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
  const [currentDeck, setCurrentDeck] = useState(dummyDeckList[0] || null);
  const [currentSideBoardPlan, setCurrentSideBoardPlan] =
    useState<SideBoardPlan>(
      dummySideBoardPlan ?? {
        id: "",
        vs: "",
        out: [],
        in: [],
        swapChampionTo: "",
        notes: "",
      },
    );

  let sideBoard = currentDeck.sideBoard;
  let mainBoard = currentDeck.mainBoard;
  const sideBoardPlans: SideBoardPlan[] = currentDeck.sideBoardPlans;
  const sideBoardPlanOptions: DropdownOption[] = sideBoardPlans.map((plan) => {
    return {
      label: plan.id,
      value: plan.id,
    };
  });
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

  const quantityOptions = (quantity: number | undefined) => {
    return Array.from({ length: quantity ?? 0 }, (_, index) => ({
      label: `${index + 1}`,
      value: index + 1,
    }));
  };
  const updateSlot = (
    sideType: SideKey,
    index: number,
    changes: Partial<CardSlot>,
  ) => {
    const key: SideKey = sideType;
    setCurrentSideBoardPlan((prev) => ({
      ...prev,
      [key]: prev[key].map((card, i) =>
        i === index ? { ...card, ...changes } : card,
      ),
    }));
  };

  const onQtyChange = (qty: string, index: number, sideType: SideKey) =>
    updateSlot(sideType, index, { quantity: parseInt(qty) });
  const onCardChange = (cardId: string, index: number, sideType: SideKey) =>
    updateSlot(sideType, index, { cardId });
  const onDeleteChange = (index: number, sideType: SideKey) => {
    setCurrentSideBoardPlan((prev) => ({
      ...prev,
      [sideType]: prev[sideType].filter((card, i) => i !== index),
    }));
  };
  const outTotal = slotsTotal(currentSideBoardPlan.out);
  const isOutWarning = outTotal > 8;
  const inTotal = slotsTotal(currentSideBoardPlan.in);
  const isInWarning = inTotal > 8;
  return (
    <SafeAreaView edges={["top", "bottom"]}>
      <ThemedView style={styles.container}>
        {/* THIS is where Logic for Side Boarding Cards In / Out Should be  */}
        <ThemedView
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingHorizontal: 10,
          }}
        >
          <ThemedText>Deck</ThemedText>
          <ThemedView
            style={{
              paddingVertical: 20,
              display: "flex",
              flexDirection: "row",
            }}
          >
            <AppDropdown
              options={deckOptions}
              value={currentDeck.id || null}
              onChange={(event) => {
                console.log();
                console.log(event);
                const selectedDeck = dummyDeckList.find(
                  (deck) => deck.id === event,
                );
                if (!selectedDeck) {
                  return;
                }
                setCurrentDeck(selectedDeck);
                setCurrentSideBoardPlan(
                  selectedDeck.sideBoardPlans[0] || undefined,
                );
              }}
            />
          </ThemedView>
        </ThemedView>
        <ThemedView
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            marginVertical: 0,
          }}
        >
          <ThemedView
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <ThemedText>Sideboard Plan</ThemedText>
            <Pressable>
              <PlusCircleIcon />
            </Pressable>
          </ThemedView>

          <ThemedView
            style={{
              paddingVertical: 20,
              display: "flex",
              flexDirection: "row",
            }}
          >
            <AppDropdown
              options={sideBoardPlanOptions}
              value={currentSideBoardPlan.id || null}
              onChange={(event) => {
                console.log(sideBoardPlans);
                console.log(event);
                const selectedSideBoard = sideBoardPlans.find(
                  (plan) => plan.id === event,
                );
                if (!selectedSideBoard) {
                  return;
                }
                setCurrentSideBoardPlan(selectedSideBoard);
              }}
            />
          </ThemedView>
        </ThemedView>
        <ThemedView>
          <ThemedView
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
            }}
          >
            <ThemedText>Side Out</ThemedText>
            <ThemedText style={[isOutWarning && styles.countWarning]}>
              {slotsTotal(currentSideBoardPlan.out)}/8
            </ThemedText>
          </ThemedView>
          {currentSideBoardPlan.out.map(
            (planSideBoardCard: any, index: number) => {
              const sideBoardQuantity = mainBoard.find(
                (actualMainBoardCard) => {
                  console.log(
                    planSideBoardCard.cardId === actualMainBoardCard.cardId,
                  );
                  return (
                    planSideBoardCard.cardId === actualMainBoardCard.cardId
                  );
                },
              )?.quantity;
              console.log(sideBoardQuantity);
              return (
                <ThemedView style={styles.row} key={index}>
                  <AppDropdown
                    value={planSideBoardCard.quantity || 1}
                    onChange={(event) => onQtyChange(event, index, "out")}
                    options={quantityOptions(sideBoardQuantity)}
                    propStyles={{ maxWidth: 70 }}
                  />
                  <AppDropdown
                    value={planSideBoardCard.cardId || null}
                    onChange={(event) => onCardChange(event, index, "out")}
                    options={mainBoardOptions}
                  />
                  <RowMenu
                    onDelete={() => {
                      onDeleteChange(index, "out");
                    }}
                  />
                </ThemedView>
              );
            },
          )}
          {slotsTotal(currentSideBoardPlan.out) < 8 ? (
            <Pressable
              style={styles.button}
              onPress={() => {
                setCurrentSideBoardPlan((prev) => ({
                  ...prev,
                  out: [...prev.out, { cardId: "", quantity: 1 }],
                }));
              }}
            >
              <ThemedView>
                <ThemedText>Add Card to Sideboard Out</ThemedText>
              </ThemedView>
              <PlusSquareIcon height={32} width={32} />
            </Pressable>
          ) : null}
        </ThemedView>
        <ThemedView>
          <ThemedView
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
            }}
          >
            <ThemedText>Side In</ThemedText>
            <ThemedText style={[isInWarning && styles.countWarning]}>
              {slotsTotal(currentSideBoardPlan.in)}/8
            </ThemedText>
          </ThemedView>
          {currentSideBoardPlan.in.map(
            (planSideBoardCard: any, index: number) => {
              const sideBoardQuantity = sideBoard.find(
                (actualMainBoardCard) => {
                  console.log(
                    planSideBoardCard.cardId === actualMainBoardCard.cardId,
                  );
                  return (
                    planSideBoardCard.cardId === actualMainBoardCard.cardId
                  );
                },
              )?.quantity;
              return (
                <ThemedView style={styles.row} key={index}>
                  <AppDropdown
                    value={planSideBoardCard.quantity || 1}
                    onChange={(event) => onQtyChange(event, index, "in")}
                    options={quantityOptions(sideBoardQuantity)}
                    propStyles={{ maxWidth: 70 }}
                  />
                  <AppDropdown
                    value={planSideBoardCard.cardId || null}
                    onChange={(event) => onCardChange(event, index, "in")}
                    options={sideBoardOptions}
                  />
                  <RowMenu
                    onDelete={() => {
                      onDeleteChange(index, "in");
                    }}
                  />
                </ThemedView>
              );
            },
          )}
          {slotsTotal(currentSideBoardPlan.in) < 8 ? (
            <Pressable
              style={styles.button}
              onPress={() => {
                setCurrentSideBoardPlan((prev) => ({
                  ...prev,
                  in: [...prev.in, { cardId: "", quantity: 1 }],
                }));
              }}
            >
              <ThemedView>
                <ThemedText>Add Card to Sideboard Out</ThemedText>
              </ThemedView>
              <PlusSquareIcon height={32} width={32} />
            </Pressable>
          ) : null}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  countWarning: { color: "#A32D2D" }, // or "red"
  scrollView: {
    flex: 1,
    flexDirection: "column",
  },
  button: {
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
    alignItems: "center",
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
    ...Platform.select({
      web: {
        width: "100%",
        height: "100%",
        paddingHorizontal: 40, // Centers it
      },
      default: {
        maxWidth: MaxContentWidth,
        marginHorizontal: 10,
        gap: 10,
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
