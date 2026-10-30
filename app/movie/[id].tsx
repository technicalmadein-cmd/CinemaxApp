import Icon from "@react-native-vector-icons/ionicons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiRequest, mediaUrl } from "@/src/auth/api";
import { colors, radius, spacing } from "@/src/theme";

export default function MovieDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["movie", id], queryFn: () => apiRequest<any>(`/api/movies/${id}`), enabled: !!id });
  const myList = useQuery({ queryKey: ["my-list"], queryFn: () => apiRequest<any[]>("/api/my-list") });

  const movie = q.data;
  const inList = (myList.data ?? []).some((m) => m.id === id);

  if (q.isLoading || !movie) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  const toggleList = async () => {
    if (inList) await apiRequest(`/api/my-list/${id}`, { method: "DELETE" });
    else await apiRequest(`/api/my-list`, { method: "POST", body: JSON.stringify({ content_type: "movie", content_id: id }) });
    qc.invalidateQueries({ queryKey: ["my-list"] });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={{ height: 420 }}>
        {movie.backdrop_url || movie.poster_url ? (
          <Image source={{ uri: movie.backdrop_url || movie.poster_url }} style={StyleSheet.absoluteFill as any} contentFit="cover" />
        ) : null}
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.4)", colors.surface]} style={StyleSheet.absoluteFill as any} />
        <View style={[styles.back, { top: insets.top + spacing.sm }]}>
          <Pressable testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="chevron-back" size={22} color={colors.onSurface} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} testID="movie-title">{movie.title}</Text>
        <Text style={styles.meta}>
          {[movie.release_year, movie.duration_minutes ? `${movie.duration_minutes} min` : null, movie.language].filter(Boolean).join(" • ")}
        </Text>
        {movie.genres?.length > 0 && (
          <View style={styles.genres}>
            {movie.genres.map((g: string) => (
              <View key={g} style={styles.genrePill}>
                <Text style={styles.genreTxt}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            testID="play-btn"
            style={styles.play}
            disabled={!movie.video_path_url}
            onPress={() =>
              router.push({ pathname: "/player/[id]", params: { id: movie.id, url: mediaUrl(movie.video_path_url) || "", title: movie.title, kind: "movie" } } as any)
            }
          >
            <Icon name="play" size={18} color={colors.onBrandPrimary} />
            <Text style={styles.playTxt}>{movie.video_path_url ? "Play Now" : "No video uploaded"}</Text>
          </Pressable>
          <Pressable testID="mylist-btn" style={styles.secondary} onPress={toggleList}>
            <Icon name={inList ? "checkmark" : "add"} size={18} color={colors.onSurface} />
            <Text style={styles.secondaryTxt}>{inList ? "In My List" : "My List"}</Text>
          </Pressable>
        </View>

        {!!movie.description && <Text style={styles.desc}>{movie.description}</Text>}

        {movie.cast?.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <Text style={styles.castTxt}>{movie.cast.join(", ")}</Text>
          </View>
        )}
        {!!movie.director && (
          <View style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>Director</Text>
            <Text style={styles.castTxt}>{movie.director}</Text>
          </View>
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
  title: { color: colors.onSurface, fontSize: 28, fontWeight: "800" },
  meta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  genres: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: spacing.md },
  genrePill: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  genreTxt: { color: colors.onSurface, fontSize: 11, fontWeight: "600" },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  play: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.brandPrimary, paddingHorizontal: spacing.xl, paddingVertical: 14, borderRadius: radius.md },
  playTxt: { color: colors.onBrandPrimary, fontWeight: "800" },
  secondary: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl, paddingVertical: 14, borderRadius: radius.md },
  secondaryTxt: { color: colors.onSurface, fontWeight: "700" },
  desc: { color: colors.onSurfaceSecondary, marginTop: spacing.lg, fontSize: 14, lineHeight: 20 },
  sectionTitle: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  castTxt: { color: colors.onSurface, marginTop: 4, fontSize: 14 },
});
