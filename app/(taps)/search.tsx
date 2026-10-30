import Icon from "@react-native-vector-icons/ionicons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiRequest } from "@/src/auth/api";
import { PosterCard } from "@/src/components/poster-card";
import { colors, radius, spacing } from "@/src/theme";

const LANGUAGES = ["All", "Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada"];
const GENRES = ["All", "Action", "Drama", "Comedy", "Thriller", "Romance", "Sci-Fi", "Horror", "Documentary"];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const [language, setLanguage] = useState("All");
  const [genre, setGenre] = useState("All");

  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (language !== "All") params.set("language", language);
  if (genre !== "All") params.set("genre", genre);
  params.set("limit", "60");

  const movies = useQuery({
    queryKey: ["search-movies", q, language, genre],
    queryFn: () => apiRequest<any[]>(`/api/movies?${params.toString()}`),
  });
  const series = useQuery({
    queryKey: ["search-series", q, language, genre],
    queryFn: () => apiRequest<any[]>(`/api/series?${params.toString()}`),
  });

  const combined = [
    ...(movies.data ?? []).map((m) => ({ ...m, content_type: "movie" as const })),
    ...(series.data ?? []).map((s) => ({ ...s, content_type: "series" as const })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top }}>
      <View style={styles.searchBox}>
        <Icon name="search-outline" size={18} color={colors.muted} />
        <TextInput
          testID="search-input"
          value={q}
          onChangeText={setQ}
          placeholder="Search movies and series"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {q.length > 0 && (
          <Pressable testID="search-clear" onPress={() => setQ("")}>
            <Icon name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <Chips testID="lang-chips" value={language} onChange={setLanguage} items={LANGUAGES} />
      <Chips testID="genre-chips" value={genre} onChange={setGenre} items={GENRES} />

      <FlatList
        testID="search-grid"
        data={combined}
        keyExtractor={(it) => `${it.content_type}-${it.id}`}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 120 }}
        columnWrapperStyle={{ gap: spacing.md }}
        renderItem={({ item }) => <PosterCard item={item} width={100} showTitle />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="film-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>No titles found</Text>
          </View>
        }
      />
    </View>
  );
}

function Chips({
  value,
  onChange,
  items,
  testID,
}: {
  value: string;
  onChange: (v: string) => void;
  items: string[];
  testID: string;
}) {
  return (
    <View style={styles.chipRow} testID={testID}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipList}>
        {items.map((it) => {
          const selected = value === it;
          return (
            <Pressable
              key={it}
              testID={`${testID}-${it}`}
              onPress={() => onChange(it)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipTxt, selected && styles.chipTxtSelected]}>{it}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, color: colors.onSurface, fontSize: 15 },
  chipRow: { height: 56, justifyContent: "center" },
  chipList: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: "center" },
  chip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipTxt: { color: colors.onSurface, fontSize: 13, fontWeight: "600" },
  chipTxtSelected: { color: colors.onBrandPrimary },
  empty: { alignItems: "center", padding: 48, gap: spacing.md },
  emptyText: { color: colors.muted, fontSize: 14 },
});
