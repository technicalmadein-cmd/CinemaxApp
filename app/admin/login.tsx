import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/src/auth/context";
import { colors, radius, spacing } from "@/src/theme";

export default function AdminLogin() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@cinemax.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const u = await signIn(email.trim(), password);
      if (u.role !== "admin") throw new Error("This account is not an admin");
      router.replace("/admin");
    } catch (e: any) { setError(e.message || "Login failed"); } finally { setLoading(false); }
  };

  return (
    <View style={styles.root} testID="admin-login">
      <View style={styles.card}>
        <Text style={styles.logo}>Cine<Text style={{ color: colors.brandPrimary }}>Max</Text> Admin</Text>
        <Text style={styles.sub}>Authorized personnel only</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput testID="admin-email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor={colors.muted} />
        <Text style={styles.label}>Password</Text>
        <TextInput testID="admin-password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholderTextColor={colors.muted} />
        {!!error && <Text style={styles.err} testID="admin-login-error">{error}</Text>}
        <Pressable testID="admin-login-submit" onPress={submit} style={styles.btn} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Text style={styles.btnTxt}>Sign in</Text>}
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  card: { width: "100%", maxWidth: 420, backgroundColor: colors.surfaceSecondary, padding: spacing.xl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  logo: { color: colors.onSurface, fontSize: 24, fontWeight: "800" },
  sub: { color: colors.muted, marginTop: 4, marginBottom: spacing.lg, fontSize: 13 },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: spacing.md },
  input: { marginTop: 6, backgroundColor: colors.surfaceTertiary, color: colors.onSurface, paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, fontSize: 14 },
  err: { color: colors.error, marginTop: spacing.md, fontSize: 13 },
  btn: { marginTop: spacing.lg, backgroundColor: colors.brandPrimary, paddingVertical: 14, borderRadius: radius.md, alignItems: "center" },
  btnTxt: { color: colors.onBrandPrimary, fontWeight: "800" },
});
