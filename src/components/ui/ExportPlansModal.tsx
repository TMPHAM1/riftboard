import DeckPlansExportView from "@/components/ui/DeckPlansExportView";
import { Spacing } from "@/constants/theme";
import { Deck } from "@/types/rift";
import { buildPlansHtml } from "@/utils/exportPlans";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  Check,
  ChevronRight,
  Eye,
  FileText,
  ImageIcon,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot, { captureRef } from "react-native-view-shot";

interface Props {
  visible: boolean;
  deck: Deck | null;
  onClose: () => void;
}

// Natural width the sheet renders at (matches SHEET_WIDTH in DeckPlansExportView).
const SHEET_WIDTH = 640;

// Deck-level export: pick which sideboard plans to include, preview the sheet
// full-size, then export as a print-ready PDF or a shareable PNG image.
export default function ExportPlansModal({ visible, deck, onClose }: Props) {
  const plans = deck?.sideboard_plans ?? [];

  // Selected plan ids — default to all selected whenever the modal (re)opens.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  // Full-size preview overlay
  const [showPreview, setShowPreview] = useState(false);
  const sheetRef = useRef<View>(null);
  // Read from context (flows through the React tree into the Modal). SafeAreaView
  // itself doesn't get correct insets inside a native Modal, so we pad manually.
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  // Desktop / web / large tablet: give the dialog a little more room than a phone.
  const isWide = screenWidth >= 768;
  // Preview sheet: centered with a sensible margin, capped so it doesn't stretch
  // edge-to-edge on wide screens.
  const previewWidth = Math.min(screenWidth - Spacing.four * 2, 800);

  useEffect(() => {
    if (visible) {
      setSelectedIds(plans.map((p) => p.id));
      setShowPreview(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, deck?.id]);

  const selectedPlans = useMemo(
    () => plans.filter((p) => selectedIds.includes(p.id)),
    [plans, selectedIds],
  );

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handlePdf = async () => {
    if (!deck || selectedPlans.length === 0) return;
    setIsExporting(true);
    try {
      const html = buildPlansHtml(deck.name, selectedPlans);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: "Share sideboard plans",
        });
      } else {
        // Web / no share sheet — open the native print dialog directly.
        await Print.printAsync({ html });
      }
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImage = async () => {
    if (!deck || !sheetRef.current || selectedPlans.length === 0) return;
    setIsExporting(true);
    try {
      const uri = await captureRef(sheetRef, { format: "png", quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share sideboard plans",
        });
      }
    } catch (err) {
      console.error("Image export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = selectedPlans.length > 0 && !isExporting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.card, isWide && styles.cardWide]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Export Plans</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={18} color="#B3C9D1" />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>{deck?.name}</Text>

          {/* Plan checklist */}
          {plans.length === 0 ? (
            <Text style={styles.emptyText}>This deck has no plans yet.</Text>
          ) : (
            <ScrollView style={styles.checklist}>
              {plans.map((plan) => {
                const checked = selectedIds.includes(plan.id);
                return (
                  <Pressable
                    key={plan.id}
                    style={styles.checkRow}
                    onPress={() => toggle(plan.id)}
                  >
                    <View
                      style={[styles.checkbox, checked && styles.checkboxOn]}
                    >
                      {checked && <Check size={13} color="#013952" />}
                    </View>
                    <Text style={styles.checkLabel} numberOfLines={1}>
                      {plan.vs}
                      {plan.vsLegend ? `  ·  vs ${plan.vsLegend}` : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {/* Preview — tap to open the full-size sheet */}
          <Pressable
            style={[
              styles.previewRow,
              selectedPlans.length === 0 && styles.previewRowDisabled,
            ]}
            onPress={() => setShowPreview(true)}
            disabled={selectedPlans.length === 0}
          >
            <Eye size={16} color="#B3C9D1" />
            <Text style={styles.previewRowText}>
              Preview {selectedPlans.length}{" "}
              {selectedPlans.length === 1 ? "plan" : "plans"}
            </Text>
            <ChevronRight size={16} color="#B3C9D1" />
          </Pressable>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, !canExport && styles.actionBtnDisabled]}
              onPress={handleImage}
              disabled={!canExport}
            >
              <ImageIcon size={16} color="#fff" />
              <Text style={styles.actionText}>Image</Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionBtn,
                styles.actionBtnPrimary,
                !canExport && styles.actionBtnDisabled,
              ]}
              onPress={handlePdf}
              disabled={!canExport}
            >
              <FileText size={16} color="#013952" />
              <Text style={[styles.actionText, styles.actionTextPrimary]}>Print / PDF</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Full-size preview — real 640px sheet, scrollable both ways. No scaling
          math, so nothing to mis-render; this is the source of truth for the look. */}
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View
          style={[
            styles.previewScreen,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.previewScreenHeader}>
            <Text style={styles.title}>Preview</Text>
            <Pressable onPress={() => setShowPreview(false)} hitSlop={12}>
              <X size={20} color="#B3C9D1" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.previewScreenBody}>
            <DeckPlansExportView
              deckName={deck?.name ?? ""}
              plans={selectedPlans}
              width={previewWidth}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Off-screen full-resolution capture target for the image export */}
      <View style={styles.offScreen} pointerEvents="none">
        <ViewShot>
          <View ref={sheetRef} collapsable={false}>
            <DeckPlansExportView
              deckName={deck?.name ?? ""}
              plans={selectedPlans}
            />
          </View>
        </ViewShot>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    // paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    backgroundColor: "#0A4A63",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1C5E78",
    padding: Spacing.three,
    gap: Spacing.two,
  },
  // Desktop / web: wider dialog so it doesn't feel like a phone modal.
  cardWide: { maxWidth: 760 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  subtitle: { fontSize: 13, color: "#B3C9D1", marginTop: -4 },
  emptyText: {
    fontSize: 14,
    color: "#B3C9D1",
    paddingVertical: Spacing.three,
    textAlign: "center",
  },

  checklist: { maxHeight: 150 },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: Spacing.two,
    paddingVertical: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#7FA3B0",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: "#E78D17", borderColor: "#E78D17" },
  checkLabel: { flex: 1, fontSize: 14, color: "#FFFFFF" },

  // Tappable preview summary row
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    gap: Spacing.two,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#013952",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1C5E78",
  },
  previewRowDisabled: { opacity: 0.4 },
  previewRowText: { flex: 1, fontSize: 14, color: "#FFFFFF", fontWeight: "500" },

  // Full-size preview screen — dark chrome, the export sheet itself stays white.
  previewScreen: { flex: 1, backgroundColor: "#013952" },
  previewScreenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1C5E78",
  },
  previewScreenBody: { padding: Spacing.three, alignItems: "center" },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: 6,
    backgroundColor: "#11607F",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtnPrimary: { backgroundColor: "#E78D17" },
  actionBtnDisabled: { opacity: 0.4 },
  actionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  actionTextPrimary: { color: "#013952", fontWeight: "700" },

  offScreen: {
    position: "absolute",
    top: -9999,
    left: -9999,
    opacity: 0,
  },
});
