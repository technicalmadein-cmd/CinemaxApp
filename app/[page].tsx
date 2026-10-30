import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";
import { colors, spacing } from "@/src/theme";

const CONTENT: Record<string, { title: string; body: string[] }> = {
  about: {
    title: "About CineMax",
    body: [
      "CineMax is a free streaming platform that brings premium movies and web series to Android viewers.",
      "All content is curated and uploaded by our editorial team. No subscriptions, no payments — just press play.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "By using CineMax you agree to use the service for personal, non-commercial viewing only.",
      "You will not redistribute, record, or re-upload any content made available through the service.",
      "We reserve the right to remove content and suspend accounts that violate these terms.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "We store your account email, hashed password, watch history and watchlist to power the app.",
      "We do not sell your data. Tokens are stored securely on your device.",
      "You may delete your account by contacting us at support@cinemax.app.",
    ],
  },
  contact: {
    title: "Contact Us",
    body: ["Email: support@cinemax.app", "Partnership & content submissions: partners@cinemax.app"],
  },
};

export default function StaticPage() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const data = CONTENT[page as string] || { title: "Page", body: ["Not found."] };
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable testID="static-back" onPress={() => router.back()}><Icon name="chevron-back" size={22} color={colors.onSurface} /></Pressable>
        <Text style={styles.title}>{data.title}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {data.body.map((p, i) => (
          <Text key={i} style={styles.body}>{p}</Text>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  title: { color: colors.onSurface, fontSize: 22, fontWeight: "800" },
  body: { color: colors.onSurfaceSecondary, lineHeight: 22, fontSize: 15 },
});
