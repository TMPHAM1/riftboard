import { EllipsisVertical, Eye, Trash } from "lucide-react-native";
import { useRef, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

interface RowMenuProps {
  onDelete: () => void;
  onView?: () => void;
}

function RowMenu({ onDelete, onView }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const anchorRef = useRef<View>(null);

  const openMenu = () => {
    anchorRef.current?.measureInWindow((x, y, w, h) => {
      const screenW = Dimensions.get("window").width;
      setPos({ top: y + h + 4, right: screenW - (x + w) });
      setOpen(true);
    });
  };

  const close = () => setOpen(false);

  return (
    <>
      <Pressable ref={anchorRef} onPress={openMenu} hitSlop={8}>
        <EllipsisVertical height={24} width={24} color="#B3C9D1" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        {/* Full-screen backdrop — tapping outside closes the menu */}
        <Pressable style={styles.backdrop} onPress={close} />

        <View style={[styles.menu, { top: pos.top, right: pos.right }]}>
          {onView && (
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                close();
                onView();
              }}
            >
              <ThemedText>View</ThemedText>
              <Eye height={20} width={20} color="#B3C9D1" />
            </Pressable>
          )}

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              close();
              onDelete();
            }}
          >
            <ThemedText style={styles.dangerText}>Delete</ThemedText>
            <Trash height={20} width={20} color="#F87171" />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menu: {
    position: "absolute",
    minWidth: 160,
    backgroundColor: "#0A4A63",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1C5E78",
    paddingVertical: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dangerText: { color: "#F87171" },
});

export default RowMenu;
