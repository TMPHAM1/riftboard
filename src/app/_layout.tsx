import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from "expo-router";
import { useColorScheme, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Colors } from "@/constants/theme";
import { LayoutDashboard, PanelLeftDashed } from "lucide-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "unspecified" ? "light" : colorScheme];

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Tabs
          screenOptions={{
            tabBarStyle: { backgroundColor: colors.background },
            tabBarActiveTintColor: colors.backgroundElement,
            header: () => {
              return <View></View>;
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              href: null, // Hidden from tab bar
            }}
          />
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color }) => <LayoutDashboard color={color} />,
            }}
          />
          <Tabs.Screen
            name="sideboard"
            options={{
              title: "Sideboards",
              tabBarIcon: ({ color }) => (
                <PanelLeftDashed color={color} width={20} height={20} />
              ),
            }}
          />
          <Tabs.Screen name="settings" options={{ title: "Settings" }} />
          <Tabs.Screen
            name="sideboard/[planId]"
            options={{ title: "sideboard/[planId]", href: null }}
          />
        </Tabs>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
