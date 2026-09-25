import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { SpiceMeter, Tag } from "@/src/components/ui";
import { DIETARY, fonts, fontSize, money, spacing } from "@/src/format";
import { makeStyles } from "@/src/theme";

export type MenuItem = {
  id: string;
  name: string;
  category_id: string;
  price: number;
  description: string;
  image: string;
  spice_grade: number;
  allow_alt_spice: boolean;
  regional_origin: string;
  portion_size: string;
  dietary_tags: string[];
  allergens: string[];
  modifier_groups: ModifierGroup[];
  popularity: number;
  course: string;
  kind: string;
  tags: string[];
  includes: string[];
  available: boolean;
  recommendations?: MenuItem[];
};

export type ModifierGroup = {
  id: string;
  name: string;
  required: boolean;
  min: number;
  max: number;
  options: { id: string; name: string; price: number }[];
};

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: "row", gap: spacing.lg, paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  rowPressed: { backgroundColor: colors.surfaceSecondary },
  info: { flex: 1, gap: spacing.sm },
  topLine: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  name: { fontFamily: fonts.display, fontSize: fontSize.lg + 1, color: colors.onSurface, flex: 1, lineHeight: 22 },
  desc: { fontFamily: fonts.text, fontSize: fontSize.base - 1, color: colors.muted, lineHeight: 19 },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.md, flexWrap: "wrap" },
  price: { fontFamily: fonts.textSemiBold, fontSize: fontSize.base, color: colors.onSurface },
  origin: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  tags: { flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" },
  imgWrap: { width: 96, height: 96, backgroundColor: colors.surfaceTertiary },
  img: { width: 96, height: 96 },
  unavailable: { opacity: 0.45 },
  unavailableBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceInverse,
    paddingVertical: 3,
    alignItems: "center",
  },
  unavailableText: { color: colors.onSurfaceInverse, fontFamily: fonts.textMedium, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase" },
  special: { fontFamily: fonts.textMedium, fontSize: 10, color: colors.brandPrimary, letterSpacing: 1.2, textTransform: "uppercase" },
}));

export function MenuItemRow({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      testID={`menu-item-${item.id}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.info, !item.available && styles.unavailable]}>
        {item.tags.includes("chef_special") ? <Text style={styles.special}>Chef's special</Text> : null}
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.price}>{money(item.price)}</Text>
          <SpiceMeter grade={item.spice_grade} />
          <Text style={styles.origin}>
            {item.regional_origin} · {item.portion_size}
          </Text>
        </View>
        {item.dietary_tags.length ? (
          <View style={styles.tags}>
            {item.dietary_tags.slice(0, 3).map((t) => (
              <Tag key={t} label={DIETARY[t] ?? t} />
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.imgWrap}>
        <Image source={{ uri: item.image }} style={[styles.img, !item.available && styles.unavailable]} contentFit="cover" transition={200} />
        {!item.available ? (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
