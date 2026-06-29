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
      data={options}
      search={!disableSearch}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      searchPlaceholder="Search..."
      value={value}
      onChange={(item) => onChange(item.value)}
      // Right side of the closed dropdown: stats (if card selected) + chevron
      renderRightIcon={(visible) => (
        <View style={styles.rightSlot}>
          {selectedCard && <CardStats card={selectedCard} size="sm" />}
          {visible
            ? <ChevronUp size={16} color="#888" />
            : <ChevronDown size={16} color="#888" />}
        </View>
      )}
      // List items: name on the left, stats pinned to the right
      renderItem={(item) => (
        <View style={styles.item}>
          <Text style={styles.itemLabel} numberOfLines={1}>{item.label}</Text>
          {item.card && <CardStats card={item.card} size="sm" />}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  placeholder: {
    color: "#9ca3af",
  },
  selectedText: {
    color: "#111827",
  },
  listContainer: {
    borderRadius: 8,
    borderColor: "#d1d5db",
  },
  rightSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
});
