import Feather from "@react-native-vector-icons/feather";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { Button, EmptyState, Tag } from "@/src/components/ui";
import { fonts, fontSize, formatDateTime, hhmmTo12, money, SERVICE_LABELS, spacing, STATUS_LABELS } from "@/src/format";
import { usesNativeTabs } from "@/src/navigation";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: spacing.md },
  title: { fontFamily: fonts.display, fontSize: fontSize["2xl"] + 4, color: colors.onSurface, paddingTop: spacing.sm },
  seg: { flexDirection: "row", borderWidth: 1, borderColor: colors.onSurface, height: 44 },
  segBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: colors.onSurface },
  segText: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurface },
  segTextOn: { color: colors.onSurfaceInverse },
  card: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  cardPressed: { backgroundColor: colors.surfaceSecondary },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  num: { fontFamily: fonts.textSemiBold, fontSize: fontSize.base, color: colors.onSurface },
  status: { fontFamily: fonts.textMedium, fontSize: fontSize.sm, color: colors.brandPrimary, letterSpacing: 0.8, textTransform: "uppercase" },
  statusDone: { color: colors.muted },
  outlet: { fontFamily: fonts.display, fontSize: fontSize.lg + 1, color: colors.onSurface },
  meta: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  items: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurface, lineHeight: 20 },
  price: { fontFamily: fonts.textSemiBold, fontSize: fontSize.base, color: colors.onSurface },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs, flexWrap: "wrap" },
  waitCard: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.surfaceInverse, gap: spacing.sm },
  waitKicker: { fontFamily: fonts.textMedium, fontSize: 11, color: colors.brandSecondary, letterSpacing: 1.6, textTransform: "uppercase" },
  waitTitle: { fontFamily: fonts.display, fontSize: fontSize["2xl"], color: colors.onSurfaceInverse },
  waitBody: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurfaceInverse, opacity: 0.85 },
}));

export default function OrdersTab() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"orders" | "reservations">("orders");
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const orders = useQuery({ queryKey: ["orders"], queryFn: () => api<any[]>("/orders"), refetchInterval: 15_000 });
  const reservations = useQuery({ queryKey: ["reservations"], queryFn: () => api<any[]>("/reservations") });
  const waitlist = useQuery({ queryKey: ["waitlist"], queryFn: () => api("/waitlist/current"), refetchInterval: 15_000 });

  const reorder = useMutation({
    mutationFn: (id: string) => api(`/orders/${id}/reorder`, { method: "POST" }),
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.show(r.skipped ? `${r.added} items added · ${r.skipped} unavailable` : `${r.added} items added to your order`, "success");
      router.push("/cart");
    },
  });
  const cancelRes = useMutation({
    mutationFn: (id: string) => api(`/reservations/${id}/cancel`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reservations"] }); toast.show("Reservation cancelled", "success"); },
    onError: (e: any) => toast.show(e.message, "error"),
  });
  const confirmRes = useMutation({
    mutationFn: (id: string) => api(`/reservations/${id}/confirm`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reservations"] }); toast.show("Reservation confirmed", "success"); },
  });
  const waitAction = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "leave" }) => api(`/waitlist/${id}/${action}`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["waitlist"] }),
  });

  const active = (s: string) => !["completed", "cancelled", "failed"].includes(s);
  const list = tab === "orders" ? orders : reservations;

  return (
    <View style={styles.root} testID="orders-screen">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Your visits</Text>
        <View style={styles.seg} testID="orders-segment">
          {(["orders", "reservations"] as const).map((t) => (
            <Pressable key={t} testID={`segment-${t}`} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} style={[styles.segBtn, tab === t && styles.segOn]} onPress={() => setTab(t)}>
              <Text style={[styles.segText, tab === t && styles.segTextOn]}>{t === "orders" ? "Orders" : "Reservations"}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {list.isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing["2xl"] }} color={colors.brandPrimary} />
      ) : tab === "orders" ? (
        <FlatList
          testID="orders-list"
          data={orders.data ?? []}
          keyExtractor={(o) => o.id}
          refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => orders.refetch()} tintColor={colors.brandPrimary} />}
          contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xl }}
          ListEmptyComponent={<EmptyState icon="clock" title="No orders yet" body="Your live and past orders will appear here." action={<Button title="Browse the menu" variant="secondary" onPress={() => router.push("/(tabs)")} />} />}
          renderItem={({ item: o }) => (
            <Pressable testID={`order-card-${o.id}`} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => router.push(`/order/${o.id}`)}>
              <View style={styles.rowTop}>
                <Text style={styles.num}>{o.number}</Text>
                <Text style={[styles.status, !active(o.status) && styles.statusDone]}>{STATUS_LABELS[o.status] ?? o.status}</Text>
              </View>
              <Text style={styles.outlet}>{o.outlet_name}</Text>
              <Text style={styles.meta}>{SERVICE_LABELS[o.service_type]} · {formatDateTime(o.created_at)}</Text>
              <Text style={styles.items} numberOfLines={2}>{o.items.map((i: any) => `${i.quantity}× ${i.name}`).join(", ")}</Text>
              <View style={styles.rowTop}>
                <Text style={styles.price}>{money(o.totals.total)}</Text>
                {!active(o.status) ? (
                  <View style={styles.actions}>
                    <Button testID={`order-reorder-${o.id}`} title="Reorder" variant="ghost" icon="refresh-cw" style={{ minHeight: 40, paddingHorizontal: spacing.md }} onPress={() => reorder.mutate(o.id)} />
                    {o.status === "completed" && !o.feedback_id ? <Button testID={`order-feedback-${o.id}`} title="Rate" variant="ghost" icon="star" style={{ minHeight: 40, paddingHorizontal: spacing.md }} onPress={() => router.push(`/feedback/${o.id}`)} /> : null}
                  </View>
                ) : <Feather name="chevron-right" size={18} color={colors.muted} />}
              </View>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          testID="reservations-list"
          data={reservations.data ?? []}
          keyExtractor={(r) => r.id}
          refreshControl={<RefreshControl refreshing={reservations.isRefetching} onRefresh={() => { reservations.refetch(); waitlist.refetch(); }} tintColor={colors.brandPrimary} />}
          contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xl }}
          ListHeaderComponent={
            <>
              {waitlist.data ? (
                <View style={styles.waitCard} testID="waitlist-card">
                  <Text style={styles.waitKicker}>Virtual waitlist · {waitlist.data.outlet_name}</Text>
                  {waitlist.data.status === "table_ready" ? (
                    <>
                      <Text style={styles.waitTitle}>Your table is ready</Text>
                      <Text style={styles.waitBody}>Please head to the host stand. We&apos;ll hold it for 10 minutes.</Text>
                      <Button testID="waitlist-accept-button" title="We're here" onPress={() => waitAction.mutate({ id: waitlist.data.id, action: "accept" })} />
                    </>
                  ) : (
                    <>
                      <Text style={styles.waitTitle}>You&apos;re #{waitlist.data.position} in line</Text>
                      <Text style={styles.waitBody}>Estimated wait ~{waitlist.data.estimated_wait_minutes} min · party of {waitlist.data.party_size}. We&apos;ll notify you when your table is ready.</Text>
                      <Button testID="waitlist-leave-button" title="Leave waitlist" variant="secondary" style={{ borderColor: colors.onSurfaceInverse }} onPress={() => waitAction.mutate({ id: waitlist.data.id, action: "leave" })} />
                    </>
                  )}
                </View>
              ) : null}
              <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
                <Button testID="reservations-new-button" title="Reserve a table" icon="calendar" onPress={() => router.push("/reserve")} />
              </View>
            </>
          }
          ListEmptyComponent={<EmptyState icon="calendar" title="No reservations" body="Book a table or join the virtual waitlist when you're nearby." />}
          renderItem={({ item: r }) => (
            <Pressable testID={`reservation-card-${r.id}`} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => router.push(`/reservation/${r.id}`)}>
              <View style={styles.rowTop}>
                <Text style={styles.num}>{r.date} · {hhmmTo12(r.time)}</Text>
                <Text style={[styles.status, !["confirmed", "pending_confirmation"].includes(r.status) && styles.statusDone]}>{STATUS_LABELS[r.status] ?? r.status}</Text>
              </View>
              <Text style={styles.outlet}>{r.outlet_name}</Text>
              <Text style={styles.meta}>Party of {r.party_size}{r.occasion ? ` · ${r.occasion}` : ""}{r.seating_preference ? ` · ${r.seating_preference}` : ""}</Text>
              {r.deposit?.required ? <Tag label={`Deposit ${money(r.deposit.amount)} · ${r.deposit.status.replace("_simulated", "")}`} /> : null}
              {r.status === "pending_confirmation" ? (
                <Button testID={`reservation-confirm-${r.id}`} title="Confirm this slot" style={{ minHeight: 44 }} onPress={() => confirmRes.mutate(r.id)} />
              ) : null}
              {["confirmed", "pending_confirmation"].includes(r.status) ? (
                <View style={styles.actions}>
                  <Button testID={`reservation-modify-${r.id}`} title="Modify" variant="ghost" icon="edit-2" style={{ minHeight: 40, paddingHorizontal: spacing.md }} onPress={() => router.push(`/reservation/${r.id}`)} />
                  <Button testID={`reservation-cancel-${r.id}`} title="Cancel" variant="ghost" icon="x" style={{ minHeight: 40, paddingHorizontal: spacing.md }} onPress={() => cancelRes.mutate(r.id)} />
                </View>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
