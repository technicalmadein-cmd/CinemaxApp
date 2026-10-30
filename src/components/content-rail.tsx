import { FlatList, StyleSheet, Text, View } from "react-native";

import { PosterCard, type PosterItem } from "@/src/components/poster-card";
import { colors, spacing } from "@/src/theme";

type Props = {
  title: string;
  data: PosterItem[];
  landscape?: boolean;
  emptyLabel?: string;
};

export function ContentRail({ title, data, landscape, emptyLabel }: Props) {
  if (!data || data.length === 0) {
    if (!emptyLabel) return null;
    return (
      <View style={styles.wrap} testID={`rail-${title}`}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>{emptyLabel}</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrap} testID={`rail-${title}`}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        keyExtractor={(it) => `${title}-${it.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PosterCard item={item} landscape={landscape} width={landscape ? 220 : 118} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl },
  title: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  list: { paddingHorizontal: spacing.lg },
  empty: {
    color: colors.muted,
    paddingHorizontal: spacing.lg,
    fontSize: 13,
  },
});
