import { SideBoardPlan } from "@/types/rift";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  plan: SideBoardPlan;
  deckName: string;
}

export default function PlanExportView({ plan, deckName }: Props) {
  const maxRows = Math.max(plan.out.length, plan.in.length);
  const rows = Array.from({ length: maxRows }, (_, i) => ({
    out: plan.out[i],
    in: plan.in[i],
  }));

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.deckName}>{deckName}</Text>
        <View style={styles.headerMeta}>
          <Text style={styles.planName}>{plan.vs}</Text>
          {plan.vsLegend && (
            <View style={styles.vsTag}>
              <Text style={styles.vsTagText}>vs {plan.vsLegend}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Column headers */}
      <View style={styles.columnRow}>
        <Text style={[styles.columnHeader, styles.col]}>SIDE OUT</Text>
        <View style={styles.colDivider} />
        <Text style={[styles.columnHeader, styles.col]}>SIDE IN</Text>
      </View>

      <View style={styles.divider} />

      {/* Card rows */}
      {rows.map((row, i) => (
        <View key={i} style={[styles.cardRow, i % 2 === 0 && styles.cardRowAlt]}>
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

      {/* Footer */}
      <View style={styles.divider} />
      <Text style={styles.footer}>
        {plan.out.reduce((s, c) => s + c.quantity, 0)} out ·{" "}
        {plan.in.reduce((s, c) => s + c.quantity, 0)} in · riftboard
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: 640,
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 12,
  },
  header: { marginBottom: 12 },
  deckName: { fontSize: 13, color: "#888", marginBottom: 2 },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  planName: { fontSize: 22, fontWeight: "700", color: "#111" },
  vsTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#FEF3C7",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  vsTagText: { fontSize: 13, color: "#92400E", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },

  columnRow: { flexDirection: "row", paddingVertical: 6 },
  columnHeader: { fontSize: 11, fontWeight: "700", color: "#555", letterSpacing: 0.8 },

  col: { flex: 1 },
  colDivider: { width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 16 },

  cardRow: { flexDirection: "row", paddingVertical: 8 },
  cardRowAlt: { backgroundColor: "#F9FAFB" },
  cardText: { fontSize: 14, color: "#111" },

  emptyText: { fontSize: 14, color: "#888", paddingVertical: 12, textAlign: "center" },

  footer: { fontSize: 11, color: "#aaa", textAlign: "right", marginTop: 4 },
});
