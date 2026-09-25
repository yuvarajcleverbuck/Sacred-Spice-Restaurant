import Feather from "@react-native-vector-icons/feather";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { useAuth } from "@/src/auth-context";
import { Button, Chip, ChipRow, Divider, EmptyState, Field, ScreenHeader, Stepper, haptic } from "@/src/components/ui";
import { fonts, fontSize, formatTime, money, SERVICE_LABELS, spacing, spiceLabel } from "@/src/format";
import { useOutlet } from "@/src/outlet-context";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

type CartLine = {
  id: string;
  item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  modifiers: { option_name: string }[];
  spice_level: number;
  instructions?: string | null;
};

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md },
  h: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  line: { flexDirection: "row", gap: spacing.md, paddingVertical: spacing.md, alignItems: "flex-start" },
  lineName: { fontFamily: fonts.textMedium, fontSize: fontSize.lg, color: colors.onSurface },
  lineMeta: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted, lineHeight: 18, marginTop: 2 },
  linePrice: { fontFamily: fonts.textSemiBold, fontSize: fontSize.base, color: colors.onSurface, marginTop: 2 },
  card: { borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs },
  cardSelected: { borderColor: colors.brandPrimary, borderWidth: 1.5 },
  cardTitle: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurface },
  cardBody: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  addRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 44 },
  addText: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.brandPrimary },
  breakdown: { backgroundColor: colors.surfaceSecondary, padding: spacing.lg, gap: spacing.sm },
  bRow: { flexDirection: "row", justifyContent: "space-between" },
  bLabel: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurfaceSecondary },
  bVal: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurfaceSecondary },
  bDiscount: { color: colors.success },
  bTotal: { fontFamily: fonts.textSemiBold, fontSize: fontSize.xl, color: colors.onSurface },
  promise: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surfaceTertiary, padding: spacing.md },
  promiseText: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurfaceTertiary, flex: 1 },
  errBox: { backgroundColor: colors.surfaceInverse, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.brandPrimary },
  errText: { color: colors.onSurfaceInverse, fontFamily: fonts.textMedium, fontSize: fontSize.base },
  sticky: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.divider, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  promoRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-end" },
  reward: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm, minHeight: 44 },
  rewardText: { flex: 1, fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurface },
  rewardPts: { fontFamily: fonts.textMedium, fontSize: fontSize.sm, color: colors.muted },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.borderStrong },
  radioOn: { borderColor: colors.brandPrimary, backgroundColor: colors.brandPrimary },
}));

export default function Cart() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { guest, refreshProfile } = useAuth();
  const { outlet } = useOutlet();

  const cart = useQuery({ queryKey: ["cart"], queryFn: () => api("/cart") });
  const loyalty = useQuery({ queryKey: ["loyalty"], queryFn: () => api("/loyalty") });

  const services = (outlet?.services ?? []).filter((s) => s !== "reservation");
  const [service, setService] = useState<string>("pickup");
  const [addressId, setAddressId] = useState<string | null>(null);
  const [tableCode, setTableCode] = useState("");
  const [scheduleOffset, setScheduleOffset] = useState(0);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<string | null>(null);
  const [rewardId, setRewardId] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [allergy, setAllergy] = useState("");
  const [tip, setTip] = useState(0);

  useEffect(() => {
    if (services.length && !services.includes(service)) setService(services[0]);
  }, [services, service]);
  useEffect(() => {
    if (!addressId && guest?.addresses?.length) setAddressId(guest.addresses[0].id);
  }, [guest?.addresses, addressId]);

  const scheduledFor = useMemo(() => (scheduleOffset ? new Date(Date.now() + scheduleOffset * 3600_000).toISOString() : null), [scheduleOffset]);
  const quoteBody = { service_type: service, address_id: addressId, promo_code: promo, redeem_reward_id: rewardId, scheduled_for: scheduledFor, table_code: tableCode || null, tip };

  const quote = useQuery({
    queryKey: ["quote", quoteBody, cart.data?.subtotal],
    queryFn: () => api("/cart/quote", { method: "POST", body: quoteBody }),
    enabled: !!cart.data?.items?.length,
  });

  const updateLine = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => api(`/cart/items/${id}`, { method: "PATCH", body: { quantity } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const place = useMutation({
    mutationFn: () =>
      api("/orders", {
        method: "POST",
        body: { ...quoteBody, order_instructions: orderNotes.trim() || null, allergy_instructions: allergy.trim() || null, idempotency_key: `${guest?.id}-${cart.data?.subtotal}-${Date.now()}` },
      }),
    onSuccess: async (order: any) => {
      haptic("medium");
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["loyalty"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      await refreshProfile();
      toast.show(`Order ${order.number} accepted`, "success");
      router.replace(`/order/${order.id}`);
    },
    onError: (e: any) => toast.show(e.message ?? "Could not place order", "error"),
  });

  const lines: CartLine[] = cart.data?.items ?? [];
  const q = quote.data;
  const ctaHeight = 84 + insets.bottom;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="cart-screen">
      <ScreenHeader title="Your order" onBack={() => router.back()} />
      {cart.isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing["2xl"] }} color={colors.brandPrimary} />
      ) : !lines.length ? (
        <EmptyState
          testID="cart-empty"
          icon="shopping-bag"
          title="Your order is empty"
          body="Explore the menu and add a few dishes to get started."
          action={<Button testID="cart-explore-button" title="Explore the menu" variant="secondary" onPress={() => router.back()} />}
        />
      ) : (
        <>
          <KeyboardAwareScrollView bottomOffset={ctaHeight + spacing.lg} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: ctaHeight + spacing.xl }}>
            <View style={styles.section}>
              <Text style={styles.h}>{outlet?.name}</Text>
              {lines.map((l) => (
                <View key={l.id} testID={`cart-line-${l.id}`}>
                  <View style={styles.line}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lineName}>{l.name}</Text>
                      <Text style={styles.lineMeta}>
                        {[...l.modifiers.map((m) => m.option_name), spiceLabel(l.spice_level)].join(" · ")}
                        {l.instructions ? `\n“${l.instructions}”` : ""}
                      </Text>
                      <Text style={styles.linePrice}>{money(l.unit_price * l.quantity)}</Text>
                    </View>
                    <Stepper testID={`cart-line-qty-${l.id}`} value={l.quantity} min={0} onChange={(v) => updateLine.mutate({ id: l.id, quantity: v })} />
                  </View>
                  <Divider />
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.h}>How would you like it?</Text>
            </View>
            <ChipRow testID="service-type-chips">
              {services.map((s) => (
                <Chip key={s} testID={`service-chip-${s}`} label={SERVICE_LABELS[s]} selected={service === s} onPress={() => setService(s)} icon={s === "delivery" ? "truck" : s === "pickup" ? "shopping-bag" : "coffee"} />
              ))}
            </ChipRow>

            {service === "delivery" ? (
              <View style={styles.section}>
                <Text style={styles.h}>Deliver to</Text>
                {(guest?.addresses ?? []).map((a) => (
                  <Pressable key={a.id} testID={`address-option-${a.id}`} style={[styles.card, addressId === a.id && styles.cardSelected]} onPress={() => setAddressId(a.id)}>
                    <Text style={styles.cardTitle}>{a.label}</Text>
                    <Text style={styles.cardBody}>{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.zip}</Text>
                  </Pressable>
                ))}
                <Pressable testID="cart-add-address-button" style={styles.addRow} onPress={() => router.push("/address")}>
                  <Feather name="plus" size={18} color={colors.brandPrimary} />
                  <Text style={styles.addText}>Add a delivery address</Text>
                </Pressable>
                {outlet ? <Text style={styles.cardBody}>Delivering to {outlet.delivery_zips.join(", ")} · min. {money(outlet.min_delivery_order)} · free over {money(outlet.free_delivery_over)}</Text> : null}
              </View>
            ) : null}

            {service === "dine_in" ? (
              <View style={styles.section}>
                <Field testID="cart-table-code-input" label="Table code (from your table card / QR)" value={tableCode} onChangeText={setTableCode} placeholder="e.g. T12" autoCapitalize="characters" />
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.h}>When</Text>
            </View>
            <ChipRow testID="schedule-chips">
              {[0, 1, 2, 3].map((h) => (
                <Chip key={h} testID={`schedule-chip-${h}`} label={h === 0 ? "As soon as possible" : `In ${h} hour${h > 1 ? "s" : ""}`} selected={scheduleOffset === h} onPress={() => setScheduleOffset(h)} />
              ))}
            </ChipRow>

            <View style={styles.section}>
              <Text style={styles.h}>Offers & rewards</Text>
              <View style={styles.promoRow}>
                <View style={{ flex: 1 }}>
                  <Field testID="cart-promo-input" label="Promo code" value={promoInput} onChangeText={setPromoInput} placeholder="WELCOME10" autoCapitalize="characters" />
                </View>
                <Button testID="cart-promo-apply" title={promo ? "Remove" : "Apply"} variant="secondary" style={{ minHeight: 48 }} onPress={() => { if (promo) { setPromo(null); setPromoInput(""); } else setPromo(promoInput.trim().toUpperCase() || null); }} />
              </View>
              {loyalty.data ? (
                <View>
                  <Text style={styles.cardBody}>You have {loyalty.data.points} points</Text>
                  {(loyalty.data.rewards ?? []).filter((r: any) => r.redeemable).map((r: any) => (
                    <Pressable key={r.id} testID={`reward-option-${r.id}`} style={styles.reward} onPress={() => setRewardId(rewardId === r.id ? null : r.id)}>
                      <View style={[styles.radio, rewardId === r.id && styles.radioOn]} />
                      <Text style={styles.rewardText}>{r.name}</Text>
                      <Text style={styles.rewardPts}>{r.points} pts</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.h}>Notes for the kitchen</Text>
              <Field testID="cart-allergy-input" label="Allergy instructions (flagged to the kitchen)" value={allergy} onChangeText={setAllergy} placeholder="e.g. severe peanut allergy" />
              <Field testID="cart-order-notes-input" label="Order instructions" value={orderNotes} onChangeText={setOrderNotes} placeholder="e.g. extra napkins, call on arrival" />
            </View>

            <View style={styles.section}>
              <Text style={styles.h}>Add a tip</Text>
            </View>
            <ChipRow testID="tip-chips">
              {[0, 2, 4, 6].map((t) => (
                <Chip key={t} testID={`tip-chip-${t}`} label={t === 0 ? "No tip" : money(t)} selected={tip === t} onPress={() => setTip(t)} />
              ))}
            </ChipRow>

            <View style={styles.section}>
              <Text style={styles.h}>Summary</Text>
              {q ? (
                <View style={styles.breakdown} testID="cart-breakdown">
                  <Row label="Items" value={money(q.subtotal)} />
                  {q.discount > 0 ? <Row label={`Promo ${q.promo?.code}`} value={`−${money(q.discount)}`} discount /> : null}
                  {q.reward_value > 0 ? <Row label={q.reward?.name} value={`−${money(q.reward_value)}`} discount /> : null}
                  {q.packaging_fee > 0 ? <Row label="Packaging" value={money(q.packaging_fee)} /> : null}
                  {service === "delivery" ? <Row label="Delivery" value={q.delivery_fee === 0 ? "Free" : money(q.delivery_fee)} /> : null}
                  {q.service_charge > 0 ? <Row label="Service charge" value={money(q.service_charge)} /> : null}
                  <Row label="Tax" value={money(q.tax)} />
                  {q.tip > 0 ? <Row label="Tip" value={money(q.tip)} /> : null}
                  <Divider style={{ marginVertical: spacing.xs }} />
                  <View style={styles.bRow}>
                    <Text style={styles.bTotal}>Total</Text>
                    <Text style={styles.bTotal} testID="cart-total">{money(q.total)}</Text>
                  </View>
                </View>
              ) : (
                <ActivityIndicator color={colors.brandPrimary} />
              )}
              {q ? (
                <View style={styles.promise} testID="cart-promise-time">
                  <Feather name="clock" size={16} color={colors.onSurfaceTertiary} />
                  <Text style={styles.promiseText}>
                    {q.kitchen_load === "busy" ? "Kitchen is busy · " : ""}
                    {q.scheduled_for ? `Scheduled for ${formatTime(q.scheduled_for)}` : `Ready in about ${q.promise_minutes} min (${formatTime(q.promise_at)})`}
                  </Text>
                </View>
              ) : null}
              {q?.errors?.length ? (
                <View style={styles.errBox} testID="cart-validation-error">
                  <Text style={styles.errText}>{q.errors[0]}</Text>
                </View>
              ) : null}
            </View>
          </KeyboardAwareScrollView>

          <View style={[styles.sticky, { paddingBottom: insets.bottom + spacing.md }]}>
            <Button
              testID="cart-place-order-button"
              title={q ? `Pay ${money(q.total)} · Place order` : "Place order"}
              disabled={!q || !q.valid}
              loading={place.isPending}
              onPress={() => place.mutate()}
            />
          </View>
        </>
      )}
    </View>
  );
}

function Row({ label, value, discount }: { label: string; value: string; discount?: boolean }) {
  const styles = useStyles();
  return (
    <View style={styles.bRow}>
      <Text style={[styles.bLabel, discount && styles.bDiscount]}>{label}</Text>
      <Text style={[styles.bVal, discount && styles.bDiscount]}>{value}</Text>
    </View>
  );
}
