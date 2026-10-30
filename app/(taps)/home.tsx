import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Dimensions, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";

import { apiRequest } from "@/src/auth/api";
import { ContentRail } from "@/src/components/content-rail";
import { colors, radius, spacing } from "@/src/theme";

const { width: SCREEN_W } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const banners = useQuery({ queryKey: ["banners"], queryFn: () => apiRequest<any[]>("/api/banners") });
  const trending = useQuery({ queryKey: ["movies", "trending"], queryFn: () => apiRequest<any[]>("/api/movies?section=trending&limit=12") });
  const latest = useQuery({ queryKey: ["movies", "latest"], queryFn: () => apiRequest<any[]>("/api/movies?section=latest&limit=12") });
  const popular = useQuery({ queryKey: ["movies", "popular"], queryFn: () => apiRequest<any[]>("/api/movies?section=popular&limit=12") });
  const recent = useQuery({ queryKey: ["movies", "recent"], queryFn: () => apiRequest<any[]>("/api/movies?limit=12") });
  const series = useQuery({ queryKey: ["series", "all"], queryFn: () => apiRequest<any[]>("/api/series?limit=12") });
  const cw = useQuery({ queryKey: ["cw"], queryFn: () => apiRequest<any[]>("/api/continue-watching") });

  const refetchAll = async () => {
    await Promise.all([banners.refetch(), trending.refetch(), latest.refetch(), popular.refetch(), recent.refetch(), series.refetch(), cw.refetch()]);
  };

  const loading = banners.isLoading && trending.isLoading;
  const hasAny =
    (banners.data?.length ?? 0) +
      (trending.data?.length ?? 0) +
      (latest.data?.length ?? 0) +
      (recent.data?.length ?? 0) +
      (series.data?.length ?? 0) >
    0;

  return (
    <ScrollView
      testID="home-screen"
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetchAll} tintColor={colors.brandPrimary} />}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.logo} testID="cinemax-logo">
          Cine<Text style={{ color: colors.brandPrimary }}>Max</Text>
        </Text>
        <Pressable testID="search-shortcut" onPress={() => router.push("/(tabs)/search")}>
          <Icon name="search-outline" size={22} color={colors.onSurface} />
        </Pressable>
      </View>

      {loading && !hasAny ? (
        <View style={{ paddingTop: 120, alignItems: "center" }}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : (
        <>
          <BannerCarousel banners={banners.data ?? []} fallback={trending.data?.[0] || latest.data?.[0]} />
          {(cw.data?.length ?? 0) > 0 && <ContentRail title="Continue Watching" data={cw.data!} landscape />}
          <ContentRail title="Trending Now" data={trending.data ?? []} />
          <ContentRail title="Latest Releases" data={latest.data ?? []} />
          <ContentRail title="Popular Movies" data={popular.data ?? []} />
          <ContentRail title="Recently Added" data={recent.data ?? []} />
          <ContentRail title="Web Series" data={(series.data ?? []).map((s) => ({ ...s, content_type: "series" }))} />
          {!hasAny && (
            <View style={styles.emptyWrap} testID="home-empty">
              <Text style={styles.emptyTitle}>Welcome to CineMax</Text>
              <Text style={styles.emptyBody}>No titles have been published yet. The admin can upload movies and series from the Admin dashboard at /admin.</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function BannerCarousel({ banners, fallback }: { banners: any[]; fallback?: any }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const items =
    banners.length > 0
      ? banners
      : fallback
      ? [{ id: fallback.id, title: fallback.title, subtitle: fallback.description, image_url: fallback.backdrop_url || fallback.poster_url, target_type: fallback.type || "movie", target_id: fallback.id }]
      : [];
  useEffect(() => {
    if (items.length < 2) return;
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % items.length;
      try {
        listRef.current?.scrollToIndex({ index: i, animated: true });
      } catch {}
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <View style={{ height: SCREEN_W * 1.15, maxHeight: 520, marginBottom: spacing.lg }}>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_W }}>
            <Image source={{ uri: item.image_url }} style={StyleSheet.absoluteFill as any} contentFit="cover" />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)", colors.surface]} style={StyleSheet.absoluteFill as any} />
            <View style={[styles.bannerInner, { paddingTop: insets.top + 60 }]}>
              <Text style={styles.bannerTitle} numberOfLines={2}>{item.title}</Text>
              {!!item.subtitle && <Text style={styles.bannerSub} numberOfLines={2}>{item.subtitle}</Text>}
              <View style={styles.bannerActions}>
                <Pressable
                  testID={`banner-play-${item.id}`}
                  style={styles.playBtn}
                  onPress={() => {
                    if (item.target_type === "series") router.push(`/series/${item.target_id}` as any);
                    else router.push(`/movie/${item.target_id || item.id}` as any);
                  }}
                >
                  <Icon name="play" size={18} color={colors.onBrandPrimary} />
                  <Text style={styles.playTxt}>Play</Text>
                </Pressable>
                <Pressable
                  testID={`banner-info-${item.id}`}
                  style={styles.infoBtn}
                  onPress={() => {
                    if (item.target_type === "series") router.push(`/series/${item.target_id}` as any);
                    else router.push(`/movie/${item.target_id || item.id}` as any);
                  }}
                >
                  <Icon name="information-circle-outline" size={18} color={colors.onSurface} />
                  <Text style={styles.infoTxt}>Info</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  logo: { color: colors.onSurface, fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
  bannerInner: { flex: 1, justifyContent: "flex-end", padding: spacing.lg, paddingBottom: spacing.xl },
  bannerTitle: { color: colors.onSurface, fontSize: 28, fontWeight: "800" },
  bannerSub: { color: colors.muted, marginTop: spacing.sm, fontSize: 13 },
  bannerActions: { flexDirection: "row", marginTop: spacing.lg, gap: spacing.md },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: 6,
  },
  playTxt: { color: colors.onBrandPrimary, fontWeight: "700" },
  infoBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: 6,
  },
  infoTxt: { color: colors.onSurface, fontWeight: "700" },
  emptyWrap: { padding: spacing.xl, alignItems: "center" },
  emptyTitle: { color: colors.onSurface, fontSize: 20, fontWeight: "700", marginBottom: spacing.sm },
  emptyBody: { color: colors.muted, textAlign: "center", fontSize: 13 },
});
