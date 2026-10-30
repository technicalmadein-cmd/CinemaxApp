import Icon from "@react-native-vector-icons/ionicons";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { apiRequest } from "@/src/auth/api";
import { ContentRail } from "@/src/components/content-rail";
import { PosterCard } from "@/src/components/poster-card";
import { colors, spacing } from "@/src/theme";

export default function MyListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const list = useQuery({ queryKey: ["my-list"], queryFn: () => apiRequest<any[]>("/api/my-list") });
  const cw = useQuery({ queryKey: ["cw"], queryFn: () => apiRequest<any[]>("/api/continue-watching") });

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.title}>My List</Text>
      </View>
      <FlatList
        testID="my-list-grid"
        data={list.data ?? []}
        keyExtractor={(it) => it.id}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 120 }}
        columnWrapperStyle={{ gap: spacing.md }}
        ListHeaderComponent={
          <View>{(cw.data?.length ?? 0) > 0 && <ContentRail title="Continue Watching" data={cw.data!} landscape />}</View>
        }
        renderItem={({ item }) => <PosterCard item={item} width={100} showTitle />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="bookmark-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyTitle}>Your list is empty</Text>
            <Text style={styles.emptySub}>Save movies & series to watch them later.</Text>
            <Pressable testID="browse-cta" style={styles.cta} onPress={() => router.push("/(tabs)/home")}>
              <Text style={styles.ctaTxt}>Browse Now</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { color: colors.onSurface, fontSize: 24, fontWeight: "800" },
  empty: { alignItems: "center", padding: 48, gap: spacing.sm },
  emptyTitle: { color: colors.onSurface, fontSize: 16, fontWeight: "700" },
  emptySub: { color: colors.muted, fontSize: 13 },
  cta: {
    marginTop: spacing.md,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  ctaTxt: { color: colors.onBrandPrimary, fontWeight: "700" },
});
