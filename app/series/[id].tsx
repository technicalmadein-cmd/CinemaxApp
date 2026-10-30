import Icon from "@react-native-vector-icons/ionicons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiRequest, mediaUrl } from "@/src/auth/api";
import { colors, radius, spacing } from "@/src/theme";

export default function SeriesDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const q = useQuery({ queryKey: ["series", id], queryFn: () => apiRequest<any>(`/api/series/${id}`), enabled: !!id });
  const [sel, setSel] = useState(0);

  if (q.isLoading || !q.data) return <View style={styles.center}><ActivityIndicator color={colors.brandPrimary} /></View>;
  const series = q.data;
  const seasons = series.seasons ?? [];
  const activeSeason = seasons[sel];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={{ height: 360 }}>
        {series.backdrop_url || series.poster_url ? <Image source={{ uri: series.backdrop_url || series.poster_url }} style={StyleSheet.absoluteFill as any} contentFit="cover" /> : null}
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.5)", colors.surface]} style={StyleSheet.absoluteFill as any} />
        <View style={[styles.back, { top: insets.top + spacing.sm }]}>
          <Pressable testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="chevron-back" size={22} color={colors.onSurface} />
          </Pressable>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} testID="series-title">{series.title}</Text>
        <Text style={styles.meta}>{[series.release_year, series.language, `${seasons.length} season(s)`].filter(Boolean).join(" • ")}</Text>
        {!!series.description && <Text style={styles.desc}>{series.description}</Text>}

        {seasons.length === 0 ? (
          <Text style={styles.empty}>No seasons added yet.</Text>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, marginTop: spacing.lg }}>
              {seasons.map((s: any, idx: number) => {
                const selected = idx === sel;
                return (
                  <Pressable key={s.id} testID={`season-${idx}`} onPress={() => setSel(idx)} style={[styles.chip, selected && styles.chipOn]}>
                    <Text style={[styles.chipTxt, selected && styles.chipTxtOn]}>Season {s.season_number}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {(activeSeason?.episodes ?? []).map((ep: any, i: number) => (
                <Pressable
                  key={ep.id}
                  testID={`ep-${ep.id}`}
                  style={styles.epRow}
                  onPress={() =>
                    router.push({ pathname: "/player/[id]", params: { id: ep.id, url: mediaUrl(ep.video_path_url) || "", title: ep.title, kind: "episode", seriesId: series.id } } as any)
                  }
                >
                  <View style={styles.epThumb}>
                    {ep.thumbnail_url ? <Image source={{ uri: ep.thumbnail_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : <Icon name="play" size={28} color={colors.brandPrimary} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.epTitle}>{i + 1}. {ep.title}</Text>
                    {!!ep.description && <Text style={styles.epDesc} numberOfLines={2}>{ep.description}</Text>}
                  </View>
                  {ep.video_path_url && <Icon name="play-circle" size={28} color={colors.brandPrimary} />}
                </Pressable>
              ))}
              {(activeSeason?.episodes ?? []).length === 0 && <Text style={styles.empty}>No episodes in this season.</Text>}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  back: { position: "absolute", left: spacing.lg },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.lg, marginTop: -40 },
  title: { color: colors.onSurface, fontSize: 26, fontWeight: "800" },
  meta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  desc: { color: colors.onSurfaceSecondary, marginTop: spacing.md, fontSize: 14, lineHeight: 20 },
  chip: { height: 36, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  chipOn: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipTxt: { color: colors.onSurface, fontWeight: "600", fontSize: 13 },
  chipTxtOn: { color: colors.onBrandPrimary },
  epRow: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: "center" },
  epThumb: { width: 110, height: 62, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  epTitle: { color: colors.onSurface, fontWeight: "700", fontSize: 14 },
  epDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  empty: { color: colors.muted, marginTop: spacing.lg, textAlign: "center" },
});
