import Feather from "@react-native-vector-icons/feather";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { MenuItem, MenuItemRow } from "@/src/components/menu-item-row";
import { Button, Chip, ChipRow, Divider, EmptyState } from "@/src/components/ui";
import { fonts, fontSize, spacing } from "@/src/format";
import { usesNativeTabs } from "@/src/navigation";
import { useOutlet } from "@/src/outlet-context";
import { makeStyles, useTheme } from "@/src/theme";

type Menu = { categories: { id: string; name: string; sort: number }[]; items: MenuItem[]; specials: MenuItem[] };

const FILTERS: { id: string; label: string; test: (i: MenuItem) => boolean }[] = [
  { id: "vegetarian", label: "Vegetarian", test: (i) => i.dietary_tags.includes("vegetarian") },
  { id: "vegan", label: "Vegan", test: (i) => i.dietary_tags.includes("vegan") },
  { id: "jain", label: "Jain", test: (i) => i.dietary_tags.includes("jain") },
  { id: "halal", label: "Halal", test: (i) => i.dietary_tags.includes("halal") },
  { id: "gluten_free", label: "Gluten-free", test: (i) => i.dietary_tags.includes("gluten_free") },
  { id: "nut_free", label: "Nut-free", test: (i) => !i.allergens.includes("nuts") },
  { id: "mild", label: "Mild", test: (i) => i.spice_grade <= 1 },
  { id: "medium", label: "Medium heat", test: (i) => i.spice_grade === 2 },
  { id: "hot", label: "Hot", test: (i) => i.spice_grade >= 3 },
  { id: "under15", label: "Under $15", test: (i) => i.price < 15 },
  { id: "popular", label: "Most popular", test: (i) => i.popularity >= 80 },
];

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider },
  topRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm, gap: spacing.sm },
  outletBtn: { flex: 1, gap: 2 },
  outletKicker: { fontFamily: fonts.textMedium, fontSize: 11, color: colors.muted, letterSpacing: 1.2, textTransform: "uppercase" },
  outletRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  outletName: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: 6,
    right: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.onBrandPrimary, fontFamily: fonts.textSemiBold, fontSize: 10 },
  searchWrap: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surfaceSecondary, paddingHorizontal: spacing.md, height: 44 },
  search: { flex: 1, fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurface, height: 44 },
  closedBanner: { backgroundColor: colors.surfaceInverse, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  closedText: { color: colors.onSurfaceInverse, fontFamily: fonts.textMedium, fontSize: fontSize.sm },
  hero: { marginHorizontal: spacing.lg, marginTop: spacing.lg, height: 200, backgroundColor: colors.surfaceTertiary },
  heroImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 150 },
  heroText: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
  heroKicker: { fontFamily: fonts.textMedium, fontSize: 11, color: colors.brandSecondary, letterSpacing: 1.6, textTransform: "uppercase" },
  heroTitle: { fontFamily: fonts.display, fontSize: fontSize["2xl"], color: colors.onSurfaceInverse, marginTop: spacing.xs },
  heroSub: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.onSurfaceInverse, opacity: 0.85, marginTop: 2 },
  catHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xs },
  catTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  quick: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
}));

export default function MenuScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { outletId, outlet } = useOutlet();
  const [category, setCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const menu = useQuery({
    queryKey: ["menu", outletId],
    queryFn: () => api<Menu>(`/outlets/${outletId}/menu`),
    enabled: !!outletId,
    refetchInterval: 30_000,
  });
  const cart = useQuery({ queryKey: ["cart"], queryFn: () => api("/cart") });
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: () => api("/notifications"), refetchInterval: 20_000 });

  const visible = useMemo(() => {
    let items = menu.data?.items ?? [];
    if (category) items = items.filter((i) => i.category_id === category);
    for (const f of filters) {
      const def = FILTERS.find((x) => x.id === f);
      if (def) items = items.filter(def.test);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => `${i.name} ${i.description} ${i.regional_origin}`.toLowerCase().includes(q));
    }
    return items;
  }, [menu.data, category, filters, search]);

  const grouped = useMemo(() => {
    const cats = menu.data?.categories ?? [];
    const rows: ({ type: "header"; id: string; name: string } | { type: "item"; item: MenuItem })[] = [];
    for (const c of cats) {
      const items = visible.filter((i) => i.category_id === c.id);
      if (!items.length) continue;
      if (!category) rows.push({ type: "header", id: c.id, name: c.name });
      items.forEach((item) => rows.push({ type: "item", item }));
    }
    return rows;
  }, [visible, menu.data, category]);

  const toggleFilter = (id: string) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const special = menu.data?.specials?.[0];
  const showHero = !category && !filters.length && !search && special;

  return (
    <View style={styles.root} testID="menu-screen">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.topRow}>
          <Pressable testID="menu-outlet-button" accessibilityRole="button" style={styles.outletBtn} onPress={() => router.push("/outlets")}>
            <Text style={styles.outletKicker}>Ordering from</Text>
            <View style={styles.outletRow}>
              <Text style={styles.outletName} numberOfLines={1}>
                {outlet?.name ?? "Choose an outlet"}
              </Text>
              <Feather name="chevron-down" size={18} color={colors.brandPrimary} />
            </View>
          </Pressable>
          <Pressable testID="menu-notifications-button" accessibilityRole="button" style={styles.iconBtn} onPress={() => router.push("/notifications")}>
            <Feather name="bell" size={22} color={colors.onSurface} />
            {notifications.data?.unread ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications.data.unread}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable testID="menu-cart-button" accessibilityRole="button" style={styles.iconBtn} onPress={() => router.push("/cart")}>
            <Feather name="shopping-bag" size={22} color={colors.onSurface} />
            {cart.data?.item_count ? (
              <View style={styles.badge} testID="menu-cart-badge">
                <Text style={styles.badgeText}>{cart.data.item_count}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color={colors.muted} />
          <TextInput
            testID="menu-search-input"
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Search dishes, regions…"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
          />
          {search ? (
            <Pressable testID="menu-search-clear" onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={16} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <ChipRow testID="menu-category-chips">
          <Chip testID="category-chip-all" label="All" selected={!category} onPress={() => setCategory(null)} />
          {(menu.data?.categories ?? []).map((c) => (
            <Chip key={c.id} testID={`category-chip-${c.id}`} label={c.name} selected={category === c.id} onPress={() => setCategory(category === c.id ? null : c.id)} />
          ))}
        </ChipRow>
        <ChipRow testID="menu-filter-chips">
          {FILTERS.map((f) => (
            <Chip key={f.id} testID={`filter-chip-${f.id}`} label={f.label} selected={filters.includes(f.id)} onPress={() => toggleFilter(f.id)} />
          ))}
        </ChipRow>
        {outlet && !outlet.is_open ? (
          <View style={styles.closedBanner} testID="outlet-closed-banner">
            <Text style={styles.closedText}>This outlet is currently closed — you can browse and schedule an order for later.</Text>
          </View>
        ) : null}
      </View>

      {menu.isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : menu.isError ? (
        <EmptyState icon="wifi-off" title="Menu failed to load" body="Check your connection and try again." action={<Button title="Retry" variant="secondary" onPress={() => menu.refetch()} />} />
      ) : (
        <FlatList
          testID="menu-list"
          data={grouped}
          keyExtractor={(r) => (r.type === "header" ? `h-${r.id}` : r.item.id)}
          refreshControl={<RefreshControl refreshing={menu.isRefetching} onRefresh={() => menu.refetch()} tintColor={colors.brandPrimary} />}
          ListHeaderComponent={
            <>
              <View style={styles.quick}>
                <Button testID="menu-reserve-button" title="Reserve a table" variant="secondary" icon="calendar" style={{ flex: 1, minHeight: 46 }} onPress={() => router.push("/reserve")} />
              </View>
              {showHero ? (
                <Pressable testID="menu-hero-special" style={styles.hero} onPress={() => router.push(`/item/${special.id}`)}>
                  <Image source={{ uri: special.image }} style={styles.heroImg} contentFit="cover" transition={300} />
                  <LinearGradient colors={[colors.scrimTransparent, colors.scrim]} style={styles.heroScrim} />
                  <View style={styles.heroText}>
                    <Text style={styles.heroKicker}>Chef&apos;s special</Text>
                    <Text style={styles.heroTitle}>{special.name}</Text>
                    <Text style={styles.heroSub} numberOfLines={1}>
                      {special.regional_origin} · {special.portion_size}
                    </Text>
                  </View>
                </Pressable>
              ) : null}
            </>
          }
          renderItem={({ item: row }) =>
            row.type === "header" ? (
              <View style={styles.catHeader}>
                <Text style={styles.catTitle}>{row.name}</Text>
              </View>
            ) : (
              <>
                <MenuItemRow item={row.item} onPress={() => router.push(`/item/${row.item.id}`)} />
                <Divider style={{ marginHorizontal: spacing.lg }} />
              </>
            )
          }
          ListEmptyComponent={
            <EmptyState
              icon="filter"
              title="No dishes match"
              body="Try removing a filter or searching for something else."
              action={<Button testID="menu-clear-filters" title="Clear filters" variant="ghost" onPress={() => { setFilters([]); setCategory(null); setSearch(""); }} />}
            />
          }
          contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xl }}
        />
      )}
    </View>
  );
}
