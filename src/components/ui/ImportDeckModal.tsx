import { DeckImportService } from "@/services/deckImportServices";
import { saveDeck } from "@/services/deckStorageService";
import { Deck } from "@/types/rift";
import { deckToText } from "@/utils/deckParser";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onImported: (deck: Deck) => void;
  // When provided, the modal runs in "edit" mode:
  // - deck name is pre-filled
  // - on save, the imported deck overwrites the existing one (same id)
  deckToEdit?: Deck;
}

export default function ImportDeckModal({ visible, onClose, onImported, deckToEdit }: Props) {
  const isEditMode = !!deckToEdit;

  const [deckName, setDeckName] = useState("");
  const [deckText, setDeckText] = useState("");
  const [loading, setLoading] = useState(false);

  // When the modal opens, pre-fill from the deck being edited (if any).
  // deckToText reconstructs the import format from stored card data so the
  // user sees the familiar section layout rather than a blank textarea.
  useEffect(() => {
    if (visible && deckToEdit) {
      setDeckName(deckToEdit.name);
      setDeckText(deckToText(deckToEdit));
    }
    if (!visible) {
      setDeckName("");
      setDeckText("");
    }
  }, [visible, deckToEdit]);

  const handleClose = () => {
    setLoading(false);
    onClose();
  };

  // In edit mode, check if any sideboard plan slots reference cards that
  // won't exist in the new deck. If so, warn the user before proceeding.
  const warnIfPlansAffected = (newDeck: Deck, oldDeck: Deck): Promise<void> =>
    new Promise((resolve, reject) => {
      const validCards = new Set([
        ...newDeck.main_deck.map((c) => c.card_name),
        ...(newDeck.sideboard ?? []).map((c) => c.card_name),
      ]);

      const removedCards = new Set<string>();
      (oldDeck.sideboard_plans ?? []).forEach((plan) => {
        [...plan.out, ...plan.in].forEach((slot) => {
          if (slot.cardId && !validCards.has(slot.cardId)) {
            removedCards.add(slot.cardId);
          }
        });
      });

      if (removedCards.size === 0) {
        resolve();
        return;
      }

      Alert.alert(
        "Cards Will Be Removed from Plans",
        `The following cards no longer exist in the updated deck and will be automatically removed from your sideboard plans:\n\n• ${[...removedCards].join("\n• ")}`,
        [
          { text: "Cancel", style: "cancel", onPress: () => reject(new Error("cancelled")) },
          { text: "Update Anyway", style: "destructive", onPress: () => resolve() },
        ],
      );
    });

  // Runs the full import pipeline and either creates or overwrites a deck.
  const ImportDeck = async () => {
    if (!deckText.trim()) {
      Alert.alert("Missing deck list", "Paste a deck list before importing.");
      return;
    }
    try {
      setLoading(true);
      const deck = await DeckImportService.importDeck(deckText, deckName.trim() || undefined);

      // In edit mode: warn about affected plans, then preserve the original id
      // so saveDeck overwrites the existing entry rather than creating a duplicate.
      if (isEditMode && deckToEdit) {
        await warnIfPlansAffected(deck, deckToEdit);
        deck.id = deckToEdit.id;
      }

      await saveDeck(deck);
      onImported(deck);
      onClose();
    } catch (err: any) {
      // "cancelled" means the user dismissed the warning — don't show an error
      if (err?.message !== "cancelled") {
        Alert.alert("Import failed", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdropPress} onPress={handleClose} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{isEditMode ? "Edit Deck" : "Import Deck"}</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <X size={20} color="#000" />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
            <Text style={styles.label}>Deck name</Text>
            <TextInput
              value={deckName}
              onChangeText={setDeckName}
              placeholder="e.g. Irelia Tempo"
              style={styles.nameInput}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.label}>
              {isEditMode ? "Paste updated deck list" : "Deck list"}
            </Text>
            <TextInput
              value={deckText}
              onChangeText={setDeckText}
              placeholder={"Legend:\n1 Card Name\nMainDeck:\n3 Card Name\n..."}
              multiline
              style={styles.textArea}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.importBtn, loading && styles.importBtnDisabled]}
              onPress={ImportDeck}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.importBtnText}>
                  {isEditMode ? "Save Changes" : "Import & Save"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropPress: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    minHeight: 220,
    textAlignVertical: "top",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  importBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  importBtnDisabled: {
    backgroundColor: "#aaa",
  },
  importBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
