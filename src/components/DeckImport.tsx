import { DeckImportService } from "@/services/deckImportServices";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function TestDeckImport() {
  const [deckText, setDeckText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testImport = async () => {
    try {
      setLoading(true);
      const deck = await DeckImportService.importDeck(deckText);
      setResult(deck);
      console.log("Success!", deck);
      Alert.alert("Success", "Deck imported successfully!");
    } catch (err: any) {
      console.error("Failed:", err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        value={deckText}
        onChangeText={setDeckText}
        placeholder="Paste deck list here..."
        multiline
        numberOfLines={10}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          minHeight: 200,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={testImport}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#ccc" : "#007AFF",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>
          {loading ? "Importing..." : "Test Import"}
        </Text>
      </TouchableOpacity>

      {result && (
        <ScrollView style={{ marginTop: 20 }}>
          <Text>Result:</Text>
          <Text style={{ fontSize: 10 }}>
            {JSON.stringify(result, null, 2)}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
