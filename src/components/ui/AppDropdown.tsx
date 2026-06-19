import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface AppDropdownProps {
  value: string | number | null;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  propStyles?: any;
}

export default function AppDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  propStyles,
}: AppDropdownProps) {
  return (
    <Dropdown
      style={{ ...styles.dropdown, ...propStyles }}
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
    flex: 1,
  },
  placeholder: {
    color: "#9ca3af",
  },
  selectedText: {
    color: "#111827",
  },
});
