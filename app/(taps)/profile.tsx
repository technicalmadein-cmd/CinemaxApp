import Icon from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { colors, radius, spacing } from "@/src/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const initials = (user?.name || user?.email || "C")[0].toUpperCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }} contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 120 }}>
      <View style={styles.header} testID="profile-header">
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name || "CineMax Viewer"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.role === "admin" && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeTxt}>ADMIN</Text>
          </View>
        )}
      </View>

      <Section title="Library">
        <Row icon="bookmark-outline" label="My List" onPress={() => router.push("/(tabs)/my-list")} testID="row-my-list" />
        <Row icon="time-outline" label="Continue Watching" onPress={() => router.push("/(tabs)/my-list")} testID="row-cw" />
      </Section>

      {user?.role === "admin" && (
        <Section title="Admin">
          <Row icon="speedometer-outline" label="Admin Dashboard" onPress={() => router.push("/admin")} testID="row-admin" />
        </Section>
      )}

      <Section title="About">
        <Row icon="information-circle-outline" label="About CineMax" onPress={() => router.push("/about")} testID="row-about" />
        <Row icon="document-text-outline" label="Terms of Service" onPress={() => router.push("/terms")} testID="row-terms" />
        <Row icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => router.push("/privacy")} testID="row-privacy" />
        <Row icon="mail-outline" label="Contact Us" onPress={() => router.push("/contact")} testID="row-contact" />
      </Section>

      <Pressable testID="logout-btn" onPress={signOut} style={styles.logoutBtn}>
        <Icon name="log-out-outline" size={18} color={colors.error} />
        <Text style={styles.logoutTxt}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}
function Row({ icon, label, onPress, testID }: any) {
  return (
    <Pressable testID={testID} onPress={onPress} style={styles.row}>
      <Icon name={icon} size={20} color={colors.onSurface} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Icon name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  avatar: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: colors.brandPrimary,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  avatarTxt: { color: colors.onBrandPrimary, fontSize: 32, fontWeight: "800" },
  name: { color: colors.onSurface, fontSize: 20, fontWeight: "700" },
  email: { color: colors.muted, marginTop: 2, fontSize: 13 },
  adminBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  adminBadgeTxt: { color: colors.onBrandTertiary, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionTitle: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1.5, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 14, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowLabel: { flex: 1, color: colors.onSurface, fontSize: 15, fontWeight: "500" },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing.sm, margin: spacing.lg, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.error, borderRadius: radius.md,
  },
  logoutTxt: { color: colors.error, fontWeight: "700" },
});
