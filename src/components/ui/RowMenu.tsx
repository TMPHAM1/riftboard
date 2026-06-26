import { EllipsisVertical, Trash } from "lucide-react-native";
import { useRef, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

function RowMenu({ onDelete }: { onDelete: () => void }) {
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
  return (
    <>
      <Pressable ref={anchorRef} onPress={openMenu} hitSlop={8}>
        <EllipsisVertical height={24} width={24} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={[styles.menu, { top: pos.top, right: pos.right }]}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <ThemedText>Delete</ThemedText>
            <Trash height={20} width={20} color="red" />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  menu: {
    position: "absolute",
    minWidth: 160,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuItemDanger: { color: "#A32D2D", fontSize: 15 },
});

export default RowMenu;
