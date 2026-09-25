import Feather from "@react-native-vector-icons/feather";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { MenuItem } from "@/src/components/menu-item-row";
import { Button, Chip, Divider, Field, SpiceMeter, Stepper, Tag, haptic } from "@/src/components/ui";
import { ALLERGENS, DIETARY, fonts, fontSize, money, spacing, spiceLabel } from "@/src/format";
import { useOutlet } from "@/src/outlet-context";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 320, width: "100%", backgroundColor: colors.surfaceTertiary },
  heroImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 200 },
  back: { position: "absolute", left: spacing.md, width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  heroText: { position: "absolute", left: spacing.xl, right: spacing.xl, bottom: spacing.xl, gap: spacing.xs },
  kicker: { fontFamily: fonts.textMedium, fontSize: 11, color: colors.brandSecondary, letterSpacing: 1.6, textTransform: "uppercase" },
  title: { fontFamily: fonts.display, fontSize: fontSize["3xl"], color: colors.onSurfaceInverse, lineHeight: 38 },
  body: { padding: spacing.xl, gap: spacing.xl },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontFamily: fonts.textSemiBold, fontSize: fontSize.xl, color: colors.onSurface },
  meta: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted },
  desc: { fontFamily: fonts.text, fontSize: fontSize.lg, color: colors.onSurface, lineHeight: 26 },
  label: { fontFamily: fonts.textMedium, fontSize: fontSize.sm, color: colors.muted, letterSpacing: 1, textTransform: "uppercase" },
  groupTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  groupHint: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  option: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, minHeight: 48 },
  radio: { width: 22, height: 22, borderWidth: 1, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  radioRound: { borderRadius: 11 },
  radioOn: { borderColor: colors.brandPrimary, backgroundColor: colors.brandPrimary },
  optName: { flex: 1, fontFamily: fonts.text, fontSize: fontSize.lg, color: colors.onSurface },
  optPrice: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.muted },
  tags: { flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" },
  allergen: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.error },
  spiceRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  includes: { gap: spacing.sm },
  includeRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  includeText: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurface },
  sticky: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.divider, paddingHorizontal: spacing.lg, paddingTop: spacing.md, flexDirection: "row", gap: spacing.md, alignItems: "center" },
  recRow: { gap: spacing.md, paddingRight: spacing.xl },
  rec: { width: 140, gap: spacing.xs },
  recImg: { width: 140, height: 100, backgroundColor: colors.surfaceTertiary },
  recName: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurface },
  recPrice: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  unavailable: { backgroundColor: colors.surfaceInverse, padding: spacing.lg },
  unavailableText: { color: colors.onSurfaceInverse, fontFamily: fonts.textMedium, fontSize: fontSize.base },
}));

export default function ItemDetail() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { outletId } = useOutlet();
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [spice, setSpice] = useState<number | null>(null);
  const [instructions, setInstructions] = useState("");

  const item = useQuery({
    queryKey: ["item", id, outletId],
    queryFn: () => api<MenuItem>(`/menu/items/${id}?outlet_id=${outletId}`),
    enabled: !!outletId,
  });

  const unitPrice = useMemo(() => {
    if (!item.data) return 0;
    let p = item.data.price;
    for (const g of item.data.modifier_groups) {
      for (const optId of selected[g.id] ?? []) {
        const o = g.options.find((x) => x.id === optId);
        if (o) p += o.price;
      }
    }
    return p;
  }, [item.data, selected]);

  const missingRequired = (item.data?.modifier_groups ?? []).filter((g) => g.required && (selected[g.id]?.length ?? 0) < g.min);

  const toggle = (gId: string, optId: string, max: number) => {
    haptic("selection");
    setSelected((s) => {
      const cur = s[gId] ?? [];
      if (max === 1) return { ...s, [gId]: cur[0] === optId ? [] : [optId] };
      if (cur.includes(optId)) return { ...s, [gId]: cur.filter((x) => x !== optId) };
      if (cur.length >= max) return s;
      return { ...s, [gId]: [...cur, optId] };
    });
  };

  const add = useMutation({
    mutationFn: () =>
      api("/cart/items", {
        method: "POST",
        body: {
          outlet_id: outletId,
          item_id: id,
          quantity: qty,
          modifiers: Object.entries(selected).flatMap(([group_id, opts]) => opts.map((option_id) => ({ group_id, option_id }))),
          spice_level: spice,
          instructions: instructions.trim() || null,
        },
      }),
    onSuccess: () => {
      haptic("medium");
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.show(`${item.data?.name} added to your order`, "success");
      router.back();
    },
    onError: (e: any) => toast.show(e.message ?? "Could not add item", "error"),
  });

  if (item.isLoading || !item.data) {
    return (
      <View style={[styles.root, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }
  const it = item.data;
  const ctaHeight = 76 + insets.bottom;

  return (
    <View style={styles.root} testID="item-detail-screen">
      <KeyboardAwareScrollView bottomOffset={ctaHeight + spacing.lg} contentContainerStyle={{ paddingBottom: ctaHeight + spacing.lg }} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Image source={{ uri: it.image }} style={styles.heroImg} contentFit="cover" transition={300} />
          <LinearGradient colors={[colors.scrimTransparent, colors.scrim]} style={styles.scrim} />
          <Pressable testID="item-back-button" accessibilityRole="button" onPress={() => router.back()} style={[styles.back, { top: insets.top + spacing.sm }]}>
            <Feather name="arrow-left" size={22} color={colors.onSurface} />
          </Pressable>
          <View style={styles.heroText}>
            <Text style={styles.kicker}>{it.regional_origin} · {it.portion_size}</Text>
            <Text style={styles.title}>{it.name}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {!it.available ? (
            <View style={styles.unavailable} testID="item-unavailable-banner">
              <Text style={styles.unavailableText}>This dish is currently unavailable at your outlet.</Text>
            </View>
          ) : null}
          <View style={styles.priceRow}>
            <Text style={styles.price} testID="item-price">{money(it.price)}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <SpiceMeter grade={it.spice_grade} />
              <Text style={styles.meta}>{spiceLabel(it.spice_grade)}</Text>
            </View>
          </View>
          <Text style={styles.desc}>{it.description}</Text>

          {it.includes.length ? (
            <View style={styles.includes}>
              <Text style={styles.label}>Includes</Text>
              {it.includes.map((x) => (
                <View key={x} style={styles.includeRow}>
                  <Feather name="check" size={14} color={colors.brandTertiary} />
                  <Text style={styles.includeText}>{x}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={{ gap: spacing.sm }}>
            <Text style={styles.label}>Dietary</Text>
            <View style={styles.tags}>
              {it.dietary_tags.length ? it.dietary_tags.map((t) => <Tag key={t} label={DIETARY[t] ?? t} />) : <Text style={styles.meta}>No dietary claims</Text>}
            </View>
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.label}>Allergens</Text>
            <Text style={styles.allergen} testID="item-allergens">
              {it.allergens.length ? `Contains ${it.allergens.map((a) => ALLERGENS[a] ?? a).join(", ")}` : "No declared allergens"}
            </Text>
          </View>

          <Divider />

          {it.allow_alt_spice ? (
            <View style={{ gap: spacing.md }}>
              <Text style={styles.groupTitle}>Spice level</Text>
              <Text style={styles.groupHint}>Kitchen default is {spiceLabel(it.spice_grade).toLowerCase()}. Choose an alternate level if you like.</Text>
              <View style={styles.spiceRow}>
                {[0, 1, 2, 3, 4].map((g) => (
                  <Chip key={g} testID={`spice-chip-${g}`} label={spiceLabel(g)} selected={(spice ?? it.spice_grade) === g} onPress={() => setSpice(g)} />
                ))}
              </View>
            </View>
          ) : null}

          {it.modifier_groups.map((g) => (
            <View key={g.id} style={{ gap: spacing.xs }} testID={`modifier-group-${g.id}`}>
              <Text style={styles.groupTitle}>{g.name}</Text>
              <Text style={styles.groupHint}>
                {g.required ? "Required" : "Optional"} · {g.max === 1 ? "choose one" : `choose up to ${g.max}`}
              </Text>
              {g.options.map((o) => {
                const on = (selected[g.id] ?? []).includes(o.id);
                return (
                  <Pressable key={o.id} testID={`modifier-option-${g.id}-${o.id}`} accessibilityRole={g.max === 1 ? "radio" : "checkbox"} accessibilityState={{ checked: on }} style={styles.option} onPress={() => toggle(g.id, o.id, g.max)}>
                    <View style={[styles.radio, g.max === 1 && styles.radioRound, on && styles.radioOn]}>
                      {on ? <Feather name="check" size={14} color={colors.onBrandPrimary} /> : null}
                    </View>
                    <Text style={styles.optName}>{o.name}</Text>
                    <Text style={styles.optPrice}>{o.price === 0 ? "Included" : o.price > 0 ? `+${money(o.price)}` : `−${money(-o.price)}`}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}

          <Field testID="item-instructions-input" label="Instructions for the kitchen" value={instructions} onChangeText={setInstructions} placeholder="e.g. less oil, no cilantro" multiline />

          {it.recommendations?.length ? (
            <View style={{ gap: spacing.md }}>
              <Text style={styles.groupTitle}>Pairs well with</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recRow}>
                {it.recommendations.map((r) => (
                  <Pressable key={r.id} testID={`recommendation-${r.id}`} style={styles.rec} onPress={() => router.push(`/item/${r.id}`)}>
                    <Image source={{ uri: r.image }} style={styles.recImg} contentFit="cover" />
                    <Text style={styles.recName} numberOfLines={1}>{r.name}</Text>
                    <Text style={styles.recPrice}>{money(r.price)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.sticky, { paddingBottom: insets.bottom + spacing.md }]}>
        <Stepper testID="item-qty-stepper" value={qty} onChange={setQty} />
        <Button
          testID="item-add-to-cart-button"
          title={missingRequired.length ? `Choose ${missingRequired[0].name.toLowerCase()}` : `Add · ${money(unitPrice * qty)}`}
          onPress={() => add.mutate()}
          disabled={!it.available || missingRequired.length > 0}
          loading={add.isPending}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
