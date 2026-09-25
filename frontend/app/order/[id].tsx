import Feather from "@react-native-vector-icons/feather";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Linking, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { Button, Divider, ScreenHeader, Tag } from "@/src/components/ui";
import { fonts, fontSize, formatTime, money, SERVICE_LABELS, spacing, spiceLabel, STATUS_LABELS } from "@/src/format";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

const FLOW: Record<string, string[]> = {
  delivery: ["accepted", "preparing", "ready", "dispatched", "completed"],
  pickup: ["accepted", "preparing", "ready", "awaiting_pickup", "completed"],
  dine_in: ["accepted", "preparing", "ready", "served", "completed"],
};
const ICONS: Record<string, string> = { accepted: "check", preparing: "coffee", ready: "package", dispatched: "truck", awaiting_pickup: "shopping-bag", served: "coffee", completed: "flag" };
const LABEL: Record<string, string> = { accepted: "Accepted", preparing: "Preparing", ready: "Ready", dispatched: "Dispatched", awaiting_pickup: "Ready for pickup", served: "Served", completed: "Delivered" };

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  body: { padding: spacing.xl, gap: spacing.xl },
  heroBlock: { gap: spacing.xs },
  kicker: { fontFamily: fonts.textMedium, fontSize: 11, color: colors.brandPrimary, letterSpacing: 1.6, textTransform: "uppercase" },
  h1: { fontFamily: fonts.display, fontSize: fontSize["3xl"], color: colors.onSurface, lineHeight: 38 },
  sub: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted, lineHeight: 22 },
  step: { flexDirection: "row", gap: spacing.lg },
  stepLeft: { alignItems: "center", width: 28 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  dotDone: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  dotCurrent: { borderColor: colors.brandPrimary, borderWidth: 2 },
  lineV: { width: 1, flex: 1, backgroundColor: colors.border, minHeight: 28 },
  lineDone: { backgroundColor: colors.brandPrimary },
  stepText: { flex: 1, paddingBottom: spacing.lg, gap: 2 },
  stepLabel: { fontFamily: fonts.textMedium, fontSize: fontSize.lg, color: colors.muted },
  stepLabelOn: { color: colors.onSurface },
  stepTime: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  h2: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  card: { backgroundColor: colors.surfaceSecondary, padding: spacing.lg, gap: spacing.sm },
  cardRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cardTitle: { fontFamily: fonts.textMedium, fontSize: fontSize.lg, color: colors.onSurfaceSecondary },
  cardBody: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm, gap: spacing.md },
  lineName: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurface, flex: 1 },
  lineMeta: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  lineVal: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurface },
  total: { fontFamily: fonts.textSemiBold, fontSize: fontSize.xl, color: colors.onSurface },
  allergy: { borderLeftWidth: 3, borderLeftColor: colors.error, paddingLeft: spacing.md, gap: 2 },
  allergyText: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.error },
  cancelled: { backgroundColor: colors.surfaceInverse, padding: spacing.lg },
  cancelledText: { color: colors.onSurfaceInverse, fontFamily: fonts.textMedium, fontSize: fontSize.base },
}));

export default function OrderDetail() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const order = useQuery({ queryKey: ["order", id], queryFn: () => api(`/orders/${id}`), refetchInterval: 8_000 });
  const cancel = useMutation({
    mutationFn: () => api(`/orders/${id}/cancel`, { method: "POST", body: { reason: "guest_request" } }),
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["loyalty"] });
      toast.show(r.cancellation === "confirmed" ? "Order cancelled" : r.message, r.cancellation === "confirmed" ? "success" : "info");
    },
    onError: (e: any) => toast.show(e.message, "error"),
  });

  const o = order.data;
  if (!o) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScreenHeader title="Order" onBack={() => router.back()} />
        <ActivityIndicator style={{ marginTop: spacing["2xl"] }} color={colors.brandPrimary} />
      </View>
    );
  }
  const flow = FLOW[o.service_type];
  const idx = o.status === "cancelled" ? -1 : flow.indexOf(o.status);
  const doneAt = (s: string) => o.timeline.find((t: any) => t.status === s)?.at;
  const isActive = !["completed", "cancelled", "failed"].includes(o.status);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="order-detail-screen">
      <ScreenHeader title={o.number} onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/orders"))} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.body}>
          <View style={styles.heroBlock}>
            <Text style={styles.kicker}>{SERVICE_LABELS[o.service_type]} · {o.outlet_name}</Text>
            <Text style={styles.h1} testID="order-status-title">{o.status === "cancelled" ? "Order cancelled" : STATUS_LABELS[o.status] ?? o.status}</Text>
            <Text style={styles.sub}>
              {o.status === "cancelled"
                ? "Your payment authorisation has been released."
                : o.status === "completed"
                  ? `Completed · you earned ${o.points_awarded ?? 0} points`
                  : o.scheduled_for
                    ? `Scheduled for ${formatTime(o.scheduled_for)}`
                    : `Promised by ${formatTime(o.promise_at)} · ${o.promise_minutes} min estimate`}
            </Text>
          </View>

          {o.status === "cancelled" ? (
            <View style={styles.cancelled} testID="order-cancelled-banner">
              <Text style={styles.cancelledText}>Cancelled {formatTime(o.timeline[o.timeline.length - 1].at)}</Text>
            </View>
          ) : (
            <View testID="order-timeline">
              {flow.map((s, i) => {
                const done = i <= idx;
                const current = i === idx;
                return (
                  <View key={s} style={styles.step} testID={`timeline-step-${s}`}>
                    <View style={styles.stepLeft}>
                      <View style={[styles.dot, done && styles.dotDone, current && !done && styles.dotCurrent]}>
                        <Feather name={ICONS[s] as any} size={13} color={done ? colors.onBrandPrimary : colors.muted} />
                      </View>
                      {i < flow.length - 1 ? <View style={[styles.lineV, i < idx && styles.lineDone]} /> : null}
                    </View>
                    <View style={styles.stepText}>
                      <Text style={[styles.stepLabel, done && styles.stepLabelOn]}>{s === "completed" && o.service_type !== "delivery" ? "Completed" : LABEL[s]}</Text>
                      {doneAt(s) ? <Text style={styles.stepTime}>{formatTime(doneAt(s))}</Text> : current ? <Text style={styles.stepTime}>In progress</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {o.courier ? (
            <View style={styles.card} testID="order-courier-card">
              <View style={styles.cardRow}>
                <Feather name="truck" size={20} color={colors.brandPrimary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{o.courier.name} · {o.courier.vehicle}</Text>
                  <Text style={styles.cardBody}>via {o.courier.partner} · live location where supported</Text>
                </View>
              </View>
              <Button testID="order-call-courier" title="Call courier" variant="secondary" icon="phone" style={{ minHeight: 44 }} onPress={() => Linking.openURL(`tel:${o.courier.phone.replace(/[^\d+]/g, "")}`)} />
            </View>
          ) : null}

          {o.service_type === "pickup" && isActive ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pickup at {o.outlet_name}</Text>
              <Text style={styles.cardBody}>Show order {o.number} at the counter. {o.address ? "" : ""}</Text>
            </View>
          ) : null}
          {o.address ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Delivering to {o.address.label}</Text>
              <Text style={styles.cardBody}>{o.address.line1}, {o.address.city} {o.address.zip}</Text>
            </View>
          ) : null}

          {o.allergy_instructions ? (
            <View style={styles.allergy} testID="order-allergy-flag">
              <Text style={styles.allergyText}>Allergy flagged to kitchen</Text>
              <Text style={styles.cardBody}>{o.allergy_instructions}</Text>
            </View>
          ) : null}

          <View style={{ gap: spacing.xs }}>
            <Text style={styles.h2}>Items</Text>
            {o.items.map((l: any) => (
              <View key={l.id} style={styles.line}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineName}>{l.quantity}× {l.name}</Text>
                  <Text style={styles.lineMeta}>{[...l.modifiers.map((m: any) => m.option_name), spiceLabel(l.spice_level)].join(" · ")}</Text>
                </View>
                <Text style={styles.lineVal}>{money(l.unit_price * l.quantity)}</Text>
              </View>
            ))}
            <Divider style={{ marginVertical: spacing.sm }} />
            <Row label="Items" value={money(o.totals.subtotal)} />
            {o.totals.discount > 0 ? <Row label={`Promo ${o.promo_code}`} value={`−${money(o.totals.discount)}`} /> : null}
            {o.totals.reward_value > 0 ? <Row label="Reward" value={`−${money(o.totals.reward_value)}`} /> : null}
            {o.totals.packaging_fee > 0 ? <Row label="Packaging" value={money(o.totals.packaging_fee)} /> : null}
            {o.service_type === "delivery" ? <Row label="Delivery" value={o.totals.delivery_fee ? money(o.totals.delivery_fee) : "Free"} /> : null}
            {o.totals.service_charge > 0 ? <Row label="Service charge" value={money(o.totals.service_charge)} /> : null}
            <Row label="Tax" value={money(o.totals.tax)} />
            {o.totals.tip > 0 ? <Row label="Tip" value={money(o.totals.tip)} /> : null}
            <View style={styles.line}>
              <Text style={styles.total}>Total</Text>
              <Text style={styles.total} testID="order-total">{money(o.totals.total)}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
              <Tag label={`Payment ${o.payment.status}`} />
              <Tag label={`POS ${o.pos.ref}`} />
              <Tag label={`KDS ${o.kds.status}`} />
            </View>
          </View>

          {isActive ? (
            <Button
              testID="order-cancel-button"
              title={o.status === "accepted" ? "Cancel order" : "Request cancellation"}
              variant="secondary"
              loading={cancel.isPending}
              onPress={() => cancel.mutate()}
            />
          ) : o.status === "completed" && !o.feedback_id ? (
            <Button testID="order-rate-button" title="Rate your order" icon="star" onPress={() => router.push(`/feedback/${o.id}`)} />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.line}>
      <Text style={styles.lineMeta}>{label}</Text>
      <Text style={styles.lineVal}>{value}</Text>
    </View>
  );
}
