import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "@/src/auth/context";
import { colors, radius, spacing } from "@/src/theme";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <View style={styles.inner} testID="signup-screen">
        <Text style={styles.logo}>Create your account</Text>
        <Text style={styles.subtitle}>100% free. No cards, no subscriptions.</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput testID="signup-name" value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted} style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <TextInput testID="signup-email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@email.com" placeholderTextColor={colors.muted} style={styles.input} />

        <Text style={styles.label}>Password</Text>
        <TextInput testID="signup-password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 6 characters" placeholderTextColor={colors.muted} style={styles.input} />

        {!!error && <Text testID="signup-error" style={styles.error}>{error}</Text>}

        <Pressable testID="signup-submit" onPress={submit} style={styles.btn} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Text style={styles.btnTxt}>Create account</Text>}
        </Pressable>

        <Pressable testID="go-signin" onPress={() => router.replace("/(auth)/sign-in")} style={styles.linkWrap}>
          <Text style={styles.link}>Already have an account? <Text style={{ color: colors.brandPrimary, fontWeight: "700" }}>Sign in</Text></Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  inner: { flex: 1, padding: spacing.xl, justifyContent: "center" },
  logo: { color: colors.onSurface, fontSize: 28, fontWeight: "800" },
  subtitle: { color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.xl, fontSize: 14 },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: spacing.md },
  input: { marginTop: spacing.sm, backgroundColor: colors.surfaceTertiary, color: colors.onSurface, paddingHorizontal: spacing.md, paddingVertical: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, fontSize: 15 },
  error: { color: colors.error, marginTop: spacing.md, fontSize: 13 },
  btn: { marginTop: spacing.xl, backgroundColor: colors.brandPrimary, paddingVertical: 16, borderRadius: radius.md, alignItems: "center" },
  btnTxt: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 16 },
  linkWrap: { marginTop: spacing.lg, alignItems: "center" },
  link: { color: colors.muted, fontSize: 14 },
});
