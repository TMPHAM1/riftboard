import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Tabs } from "expo-router";
import { useColorScheme, View } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.backgroundElement,
        header: () => <View></View>,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          href: null,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon
              icon={faCoffee}
              size={28}
              color={colors.backgroundSelected}
            />
          ),
        }}
      />
      <Tabs.Screen name="sideboard" options={{ title: "Sideboards" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen
        name="sideboard/[planId]"
        options={{ title: "Sideboard/[planId]", href: null }}
      />
    </Tabs>
  );
}