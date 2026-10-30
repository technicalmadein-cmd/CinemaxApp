import Icon from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { useAuth } from "@/src/auth/context";
import { colors } from "@/src/theme";
import { Redirect } from "expo-router";

export default function TabsLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet_hairline(),
          ...(Platform.OS === "web" ? { height: 64 } : {}),
        },
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ color, size, focused }) => {
          const map: Record<string, [string, string]> = {
            home: ["home", "home-outline"],
            search: ["search", "search-outline"],
            "my-list": ["bookmark", "bookmark-outline"],
            profile: ["person", "person-outline"],
          };
          const [filled, outline] = map[route.name] || ["ellipse", "ellipse-outline"];
          return <Icon name={(focused ? filled : outline) as any} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="my-list" options={{ title: "My List" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

function StyleSheet_hairline() {
  // Avoids importing StyleSheet just for hairline.
  return 1;
}
