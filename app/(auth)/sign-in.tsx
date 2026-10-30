import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "@/src/auth/context";
import { colors, radius, spacing } from "@/src/theme";

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <View style={styles.inner} testID="signin-screen">
        <Text style={styles.logo}>Cine<Text style={{ color: colors.brandPrimary }}>Max</Text></Text>
        <Text style={styles.subtitle}>Watch unlimited movies & series — free.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          testID="signin-email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@email.com"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          testID="signin-password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        {!!error && <Text testID="signin-error" style={styles.error}>{error}</Text>}

        <Pressable testID="signin-submit" onPress={submit} style={styles.btn} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Text style={styles.btnTxt}>Sign in</Text>}
        </Pressable>

        <Pressable testID="go-signup" onPress={() => router.push("/(auth)/sign-up")} style={styles.linkWrap}>
          <Text style={styles.link}>
            New here? <Text style={{ color: colors.brandPrimary, fontWeight: "700" }}>Create a free account</Text>
          </Text>
        </Pressable>

        <View style={styles.hint}>
          <Text style={styles.hintTxt}>Admin? Go to <Text style={{ color: colors.brandPrimary }}>/admin</Text> on the web console.</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  inner: { flex: 1, padding: spacing.xl, justifyContent: "center" },
  logo: { color: colors.onSurface, fontSize: 44, fontWeight: "900", letterSpacing: 1 },
  subtitle: { color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.xl, fontSize: 14 },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: spacing.md },
  input: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    color: colors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  error: { color: colors.error, marginTop: spacing.md, fontSize: 13 },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnTxt: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 16 },
  linkWrap: { marginTop: spacing.lg, alignItems: "center" },
  link: { color: colors.muted, fontSize: 14 },
  hint: { marginTop: spacing.xxl, alignItems: "center" },
  hintTxt: { color: colors.muted, fontSize: 12 },
});
