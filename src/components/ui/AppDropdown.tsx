import CardStats from "@/components/ui/CardStats";
import { RiftCard } from "@/types/rift";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export interface DropdownOption {
  label: string;
  value: string | number;
  card?: RiftCard; // optional — enables inline stat circles when set
}

interface AppDropdownProps {
  value: string | number | null;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  propStyles?: any;
  disableSearch?: boolean;
}

export default function AppDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  propStyles,
  disableSearch = false,
}: AppDropdownProps) {
  const selectedCard = options.find((o) => o.value === value)?.card;

  return (
    <Dropdown
      style={{ ...styles.dropdown, ...propStyles }}
      placeholderStyle={styles.placeholder}
      selectedTextStyle={styles.selectedText}
      containerStyle={styles.listContainer}
      itemContainerStyle={styles.itemContainer}
      activeColor={ACTIVE_COLOR}
      inputSearchStyle={styles.searchInput}
      data={options}
      search={!disableSearch}
      maxHeight={320}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      searchPlaceholder="Search…"
      value={value}
      onChange={(item) => onChange(item.value)}
      accessibilityLabel={placeholder}
      // Right side of the closed dropdown: stats (if card selected) + chevron
      renderRightIcon={(visible) => (
        <View style={styles.rightSlot}>
          {selectedCard && <CardStats card={selectedCard} size="sm" />}
          {visible
            ? <ChevronUp size={18} color={ACCENT} />
            : <ChevronDown size={18} color={MUTED} />}
        </View>
      )}
      // List items: name on the left, stats pinned to the right.
      // `selected` lets us mark the active row for clearer navigation.
      renderItem={(item, selected) => (
        <View style={[styles.item, selected && styles.itemSelected]}>
          <Text
            style={[styles.itemLabel, selected && styles.itemLabelSelected]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
          {item.card && <CardStats card={item.card} size="sm" />}
        </View>
      )}
    />
  );
}

const SURFACE = "#0A4A63";
const BORDER = "#1C5E78";
const ACTIVE_COLOR = "#11607F";
const ACCENT = "#E78D17";
const MUTED = "#B3C9D1";

const styles = StyleSheet.create({
  dropdown: {
    height: 50, // ≥ 44px WCAG-friendly touch target
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: SURFACE,
    flex: 1,
  },
  placeholder: {
    color: "#7FA3B0",
    fontSize: 15,
  },
  selectedText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  searchInput: {
    borderRadius: 8,
    borderColor: BORDER,
    backgroundColor: "#013952",
    color: "#FFFFFF",
    height: 44,
  },
  listContainer: {
    borderRadius: 10,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    overflow: "hidden",
  },
  itemContainer: {
    backgroundColor: SURFACE,
  },
  rightSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44, // comfortable tap target with spacing
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  itemSelected: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
  },
  itemLabelSelected: {
    color: ACCENT,
    fontWeight: "600",
  },
});
