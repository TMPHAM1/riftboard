import { SideBoardPlan } from "@/types/rift";
import { StyleSheet, Text, View } from "react-native";

// Fixed width keeps captureRef output crisp regardless of device size.
const SHEET_WIDTH = 640;

interface PlanBlockProps {
  plan: SideBoardPlan;
}

// A single matchup plan rendered as a compact two-column block.
// Mirrors the layout used by buildPlansHtml (exportPlans.ts) so the image
// and PDF exports stay visually consistent.
export function PlanBlock({ plan }: PlanBlockProps) {
  const maxRows = Math.max(plan.out.length, plan.in.length);
  const rows = Array.from({ length: maxRows }, (_, i) => ({
    out: plan.out[i],
    in: plan.in[i],
  }));

  return (
    <View style={styles.plan}>
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.vs}</Text>
        {plan.vsLegend && (
          <View style={styles.vsTag}>
            <Text style={styles.vsTagText}>vs {plan.vsLegend}</Text>
          </View>
        )}
      </View>

      <View style={styles.columnRow}>
        <Text style={[styles.columnHeader, styles.col]}>SIDE OUT</Text>
        <View style={styles.colDivider} />
        <Text style={[styles.columnHeader, styles.col]}>SIDE IN</Text>
      </View>
      <View style={styles.divider} />

      {rows.map((row, i) => (
        <View
          key={i}
          style={[styles.cardRow, i % 2 === 0 && styles.cardRowAlt]}
        >
          <Text style={[styles.cardText, styles.col]}>
            {row.out ? `${row.out.quantity}× ${row.out.cardId}` : ""}
          </Text>
          <View style={styles.colDivider} />
          <Text style={[styles.cardText, styles.col]}>
            {row.in ? `${row.in.quantity}× ${row.in.cardId}` : ""}
          </Text>
        </View>
      ))}

      {rows.length === 0 && (
        <Text style={styles.emptyText}>No cards in this plan.</Text>
      )}

      <Text style={styles.planFooter}>
        {plan.out.reduce((s, c) => s + c.quantity, 0)} out ·{" "}
        {plan.in.reduce((s, c) => s + c.quantity, 0)} in
      </Text>
    </View>
  );
}

interface Props {
  deckName: string;
  plans: SideBoardPlan[];
  // Render width. Defaults to 640 (crisp for captureRef). The on-screen preview
  // passes the device width so the sheet fits instead of running off-screen.
  width?: number;
}

// The full deck sheet: deck name header + one PlanBlock per selected plan.
// Used both as the modal preview and as the off-screen captureRef target.
export default function DeckPlansExportView({
  deckName,
  plans,
  width = SHEET_WIDTH,
}: Props) {
  return (
    <View style={[styles.page, { width }]}>
      <Text style={styles.deckName}>{deckName}</Text>
      {plans.map((plan) => (
        <PlanBlock key={plan.id} plan={plan} />
      ))}
      {plans.length === 0 && (
        <Text style={styles.emptyText}>No plans selected.</Text>
      )}
      <Text style={styles.footer}>riftboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    padding: 0,
  },
  deckName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },

  plan: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  planName: { fontSize: 16, fontWeight: "700", color: "#111" },
  vsTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: "#FEF3C7",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  vsTagText: { fontSize: 11, color: "#92400E", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#E5E7EB" },
  columnRow: { flexDirection: "row", paddingVertical: 4 },
  columnHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: "#555",
    letterSpacing: 0.8,
  },
  col: { flex: 1 },
  colDivider: { width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 12 },

  cardRow: { flexDirection: "row", paddingVertical: 5 },
  cardRowAlt: { backgroundColor: "#F9FAFB" },
  cardText: { fontSize: 12, color: "#111" },

  emptyText: {
    fontSize: 13,
    color: "#888",
    paddingVertical: 12,
    textAlign: "center",
  },
  planFooter: { fontSize: 10, color: "#aaa", textAlign: "right", marginTop: 8 },
  footer: { fontSize: 11, color: "#aaa", textAlign: "right", marginTop: 4 },
});
