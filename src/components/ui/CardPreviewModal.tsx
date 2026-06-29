import { Spacing } from '@/constants/theme';
import { RiftCard } from '@/types/rift';
import { X } from 'lucide-react-native';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../themed-text';
import CardStats from './CardStats';

interface Props {
  card: RiftCard | null;
  visible: boolean;
  onClose: () => void;
}

export default function CardPreviewModal({ card, visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <X size={22} color="#000" />
            </Pressable>

            {card && (
              <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={{ uri: card.media.image_url }}
                  style={[
                    styles.image,
                    card.orientation === 'landscape' ? styles.landscape : styles.portrait,
                  ]}
                  resizeMode="contain"
                />

                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <ThemedText type="smallBold" style={styles.name}>{card.name}</ThemedText>
                    <CardStats card={card} size="md" />
                  </View>

                  <ThemedText style={styles.meta}>
                    {[card.classification.type, ...card.classification.domain].join(' · ')}
                  </ThemedText>
                </View>
              </ScrollView>
            )}
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  safeArea: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    zIndex: 10,
    padding: Spacing.one,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  image: {
    width: '100%',
    marginVertical: Spacing.four,
  },
  portrait: {
    aspectRatio: 2 / 3,
  },
  landscape: {
    aspectRatio: 3 / 2,
  },
  info: {
    width: '100%',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    flexShrink: 1,
  },
  meta: {
    fontSize: 13,
    color: '#666',
  },
});
