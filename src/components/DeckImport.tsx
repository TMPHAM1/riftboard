import { DeckImportService } from "@/services/deckImportServices";
import { saveDeck } from "@/services/deckStorageService";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const IRELIA_DECK = `Legend:
1 Irelia, Blade Dancer
Champion:
1 Irelia, Fervent
MainDeck:
3 Boots of Swiftness
2 Charm
3 Defiant Dance
3 Defy
3 Discipline
1 Edge of Night
2 En Garde
1 Flash
2 Guardian Angel
2 Gust
1 Irelia, Fervent
2 Ride the Wind
3 Scuttle Crab
1 Stacked Deck
1 Star-Crossed
3 Stellacorn Herder
3 Tideturner
2 Vex, Apathetic
1 Zhonya's Hourglass
Battlefields:
1 Abandoned Hall
1 Rockfall Path
1 Targon's Peak
Runes:
6 Calm Rune
6 Chaos Rune
Sideboard:
1 Abandon
2 Adaptatron
1 Disarming Rake
1 Gust
1 Not So Fast
1 Rebuke`;

export function TestDeckImport() {
  const [deckText, setDeckText] = useState(IRELIA_DECK);
  const [deckName, setDeckName] = useState("Irelia");
  const [loading, setLoading] = useState(false);
  const [savedName, setSavedName] = useState<string | null>(null);

  const runImport = async () => {
    try {
      setLoading(true);
      setSavedName(null);
      const deck = await DeckImportService.importDeck(deckText, deckName || undefined);
      await saveDeck(deck);
      setSavedName(deck.name);
      Alert.alert("Saved", `"${deck.name}" imported and saved locally.`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <TextInput
        value={deckName}
        onChangeText={setDeckName}
        placeholder="Deck name"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 16,
        }}
      />

      <TextInput
        value={deckText}
        onChangeText={setDeckText}
        placeholder="Paste deck list here..."
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          minHeight: 200,
          marginBottom: 16,
          fontFamily: "monospace",
          fontSize: 12,
        }}
      />

      <TouchableOpacity
        onPress={runImport}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#ccc" : "#007AFF",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          {loading ? "Importing…" : "Import & Save"}
        </Text>
      </TouchableOpacity>

      {savedName && (
        <Text style={{ marginTop: 12, color: "#2e7d32", textAlign: "center" }}>
          ✓ "{savedName}" saved to local storage
        </Text>
      )}
    </ScrollView>
  );
}
