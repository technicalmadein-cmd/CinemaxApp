import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

export type PosterItem = {
  id: string;
  title: string;
  poster_url?: string;
  backdrop_url?: string;
  type?: "movie" | "series";
  content_type?: "movie" | "series";
  language?: string;
  release_year?: number;
  progress?: { position_seconds: number; duration_seconds: number } | any;
};

type Props = {
  item: PosterItem;
  width?: number;
  landscape?: boolean;
  showTitle?: boolean;
  overrideHref?: string;
};

export function PosterCard({ item, width = 120, landscape = false, showTitle = false, overrideHref }: Props) {
  const router = useRouter();
  const h = landscape ? (width * 9) / 16 : (width * 3) / 2;
  const kind = item.content_type || item.type || "movie";
  const href =
    overrideHref ||
    (kind === "series" ? `/series/${item.id}` : `/movie/${item.id}`);

  const image = landscape ? item.backdrop_url || item.poster_url : item.poster_url || item.backdrop_url;
  const progressPct = item.progress
    ? Math.min(1, (item.progress.position_seconds || 0) / Math.max(1, item.progress.duration_seconds || 1))
    : 0;

  return (
    <Pressable
      testID={`poster-${item.id}`}
      onPress={() => router.push(href as any)}
      style={[styles.card, { width }]}
    >
      <View style={[styles.imgWrap, { width, height: h }]}>
        {image ? (
          <Image source={{ uri: image }} style={styles.img} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.img, styles.placeholder]}>
            <Text style={styles.placeholderText}>{item.title?.[0]?.toUpperCase() || "C"}</Text>
          </View>
        )}
        {progressPct > 0 && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
          </View>
        )}
      </View>
      {showTitle && (
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginRight: spacing.md },
  imgWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceTertiary,
  },
  img: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  placeholderText: { color: colors.brandPrimary, fontSize: 32, fontWeight: "800" },
  progressTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressFill: { height: 3, backgroundColor: colors.brandPrimary },
  title: {
    color: colors.onSurface,
    fontSize: 13,
    marginTop: spacing.sm,
    fontWeight: "600",
  },
});
