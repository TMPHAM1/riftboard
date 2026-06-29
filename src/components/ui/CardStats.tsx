import { RiftCard } from "@/types/rift";
import { StyleSheet, Text, View } from "react-native";

const DOMAIN_COLOR: Record<string, string> = {
  Calm: "#27AE60",
  Chaos: "#9B59B6",
  Fury: "#E84545",
  Order: "#4A90D9",
  Valor: "#F5A623",
  Noxus: "#C0392B",
  Freljord: "#2980B9",
  Ionia: "#27AE60",
  Shurima: "#E67E22",
  Targon: "#8E44AD",
  Demacia: "#2C3E50",
  Bandle: "#F1C40F",
  Bilgewater: "#16A085",
  PiltoverZaun: "#1ABC9C",
};

function getDomainColor(domain: string): string {
  return DOMAIN_COLOR[domain] ?? "#888";
}

interface PowerCircleProps {
  domains: string[];
  power: number;
  dim: number;
  fontSize: number;
}

// Renders a solid circle for single-domain cards, or a split half-half circle
// for dual-domain cards (e.g. Defiant Dance: Chaos left, Calm right).
function PowerCircle({ domains, power, dim, fontSize }: PowerCircleProps) {
  const radius = dim / 2;

  if (domains.length >= 2) {
    const left = getDomainColor(domains[0]);
    const right = getDomainColor(domains[1]);
    return (
      <View style={[{ width: dim, height: dim, borderRadius: radius, overflow: "hidden" }]}>
        {/* Two half-width views clipped by the circle */}
        <View style={{ flexDirection: "row", width: dim, height: dim }}>
          <View style={{ width: radius, height: dim, backgroundColor: left }} />
          <View style={{ width: radius, height: dim, backgroundColor: right }} />
        </View>
        {/* Power number centred over the split */}
        <Text
          style={[
            styles.powerLabel,
            {
              position: "absolute",
              width: dim,
              lineHeight: dim,
              fontSize,
              textAlign: "center",
            },
          ]}
        >
          {power}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.circle,
        { width: dim, height: dim, borderRadius: radius, backgroundColor: getDomainColor(domains[0] ?? "") },
      ]}
    >
      <Text style={[styles.powerLabel, { fontSize }]}>{power}</Text>
    </View>
  );
}

interface Props {
  card: RiftCard;
  size?: "sm" | "md";
}

export default function CardStats({ card, size = "md" }: Props) {
  const dim = size === "sm" ? 26 : 36;
  const fontSize = size === "sm" ? 11 : 14;
  const hasPower = card.attributes.power != null;

  return (
    <View style={styles.row}>
      {card.attributes.energy != null && (
        <View style={[styles.circle, styles.energyCircle, { width: dim, height: dim, borderRadius: dim / 2 }]}>
          <Text style={[styles.energyLabel, { fontSize }]}>{card.attributes.energy}</Text>
        </View>
      )}
      {hasPower && (
        <PowerCircle
          domains={card.classification.domain}
          power={card.attributes.power!}
          dim={dim}
          fontSize={fontSize}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  circle: {
    justifyContent: "center",
    alignItems: "center",
  },
  energyCircle: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#D0D0D0",
    shadowColor: "#aaa",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  energyLabel: {
    fontWeight: "700",
    color: "#222",
  },
  powerLabel: {
    fontWeight: "700",
    color: "#fff",
  },
});
