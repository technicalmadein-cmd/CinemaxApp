import { Redirect } from "expo-router";
import { useAuth } from "@/src/auth/context";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/src/theme";
import AdminHome from "./dashboard";

export default function AdminIndex() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={colors.brandPrimary} /></View>;
  if (!user) return <Redirect href="/admin/login" />;
  if (user.role !== "admin") return <Redirect href="/(tabs)/home" />;
  return <AdminHome />;
}
