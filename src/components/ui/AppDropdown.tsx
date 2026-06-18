import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export interface DropdownOption {
  label: string;
  value: string;
}

interface AppDropdownProps {
  value: string | null;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
}

export default function AppDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: AppDropdownProps) {
  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholder}
      selectedTextStyle={styles.selectedText}
      data={options}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      searchPlaceholder="Search..."
      value={value}
      onChange={(item) => onChange(item.value)}
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
  },
  placeholder: {
    color: "#9ca3af",
  },
  selectedText: {
    color: "#111827",
  },
});
