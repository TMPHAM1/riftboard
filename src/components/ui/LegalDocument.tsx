import { ThemedText } from "@/components/themed-text";
import { ContentLayout, Spacing } from "@/constants/theme";
import type { LegalContent } from "@/constants/legal";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  content: LegalContent;
}

// Themed, scrollable renderer for a legal document (Privacy Policy / Terms).
// Reads insets from context so the header clears the notch inside the stack.
export default function LegalDocument({ content }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backBtn}
        >
          <ChevronLeft size={22} color="#B3C9D1" />
          <ThemedText themeColor="textSecondary">Back</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
      >
        <ThemedText type="subtitle" style={styles.title}>
          {content.title}
        </ThemedText>
        <ThemedText themeColor="textSecondary" type="small" style={styles.date}>
          Effective {content.effectiveDate}
        </ThemedText>

        {content.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <ThemedText type="smallBold" style={styles.heading}>
              {section.heading}
            </ThemedText>
            {section.paragraphs.map((p, i) => (
              <ThemedText
                key={i}
                themeColor="textSecondary"
                type="small"
                style={styles.paragraph}
              >
                {p}
              </ThemedText>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#013952" },
  header: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 44,
    alignSelf: "flex-start",
    paddingRight: Spacing.two,
  },
  body: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    ...ContentLayout,
  },
  title: { fontSize: 26, lineHeight: 32 },
  date: { marginTop: Spacing.one, marginBottom: Spacing.four },
  section: { marginBottom: Spacing.four, gap: Spacing.two },
  heading: { fontSize: 15, color: "#FFFFFF" },
  paragraph: { lineHeight: 21 },
});
