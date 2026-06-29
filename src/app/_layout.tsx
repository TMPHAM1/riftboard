import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from "expo-router";
import { useColorScheme, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Colors } from "@/constants/theme";
import { LayoutDashboard, PanelLeftDashed } from "lucide-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "unspecified" ? "light" : colorScheme];

  // React Navigation paints the scene background from its OWN theme. Override it
  // with our app background so every screen matches (otherwise dark mode shows a
  // black scene behind transparent screens like sideboard/[planId]).
  const baseNavTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseNavTheme,
    colors: { ...baseNavTheme.colors, background: colors.background },
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navTheme}>
        <AnimatedSplashOverlay />
        <Tabs
          screenOptions={{
            sceneStyle: { backgroundColor: colors.background },
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
