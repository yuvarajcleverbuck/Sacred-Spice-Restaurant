import Feather from "@react-native-vector-icons/feather";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { Button, Divider, ScreenHeader, Stepper, Tag } from "@/src/components/ui";
import { fonts, fontSize, hhmmTo12, money, spacing, STATUS_LABELS } from "@/src/format";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  body: { padding: spacing.xl, gap: spacing.xl },
  kicker: { fontFamily: fonts.textMedium, fontSize: 11, color: colors.brandPrimary, letterSpacing: 1.6, textTransform: "uppercase" },
  h1: { fontFamily: fonts.display, fontSize: fontSize["3xl"], color: colors.onSurface, lineHeight: 38 },
  sub: { fontFamily: fonts.text, fontSize: fontSize.lg, color: colors.muted, lineHeight: 24 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  rowText: { fontFamily: fonts.text, fontSize: fontSize.lg, color: colors.onSurface, flex: 1 },
  policy: { backgroundColor: colors.surfaceSecondary, padding: spacing.lg, gap: spacing.xs },
  policyTitle: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurfaceSecondary },
  policyBody: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted, lineHeight: 18 },
  modify: { gap: spacing.md },
  h2: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
}));

export default function ReservationDetail() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [party, setParty] = useState<number | null>(null);

  const res = useQuery({ queryKey: ["reservation", id], queryFn: () => api(`/reservations/${id}`) });
  const done = () => { qc.invalidateQueries({ queryKey: ["reservation", id] }); qc.invalidateQueries({ queryKey: ["reservations"] }); qc.invalidateQueries({ queryKey: ["notifications"] }); };

  const act = useMutation({
    mutationFn: (action: "confirm" | "cancel" | "check-in") => api(`/reservations/${id}/${action}`, { method: "POST" }),
    onSuccess: (_, action) => { done(); toast.show(action === "cancel" ? "Reservation cancelled" : action === "confirm" ? "Reservation confirmed" : "Checked in — see you shortly", "success"); },
    onError: (e: any) => toast.show(e.message, "error"),
  });
  const modify = useMutation({
    mutationFn: () => api(`/reservations/${id}`, { method: "PATCH", body: { party_size: party } }),
    onSuccess: () => { done(); setParty(null); toast.show("Reservation updated", "success"); },
    onError: (e: any) => toast.show(e.message, "error"),
  });

  const r = res.data;
  if (!r) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScreenHeader title="Reservation" onBack={() => router.back()} />
        <ActivityIndicator style={{ marginTop: spacing["2xl"] }} color={colors.brandPrimary} />
      </View>
    );
  }
  const live = ["confirmed", "pending_confirmation"].includes(r.status);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="reservation-detail-screen">
      <ScreenHeader title="Reservation" onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/orders"))} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.body}>
          <View style={{ gap: spacing.xs }}>
            <Text style={styles.kicker}>{STATUS_LABELS[r.status] ?? r.status}</Text>
            <Text style={styles.h1} testID="reservation-title">{r.outlet_name}</Text>
            <Text style={styles.sub}>{new Date(`${r.date}T12:00:00`).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })} at {hhmmTo12(r.time)}</Text>
          </View>

          {r.status === "pending_confirmation" ? (
            <Button testID="reservation-confirm-button" title="Confirm this slot" loading={act.isPending} onPress={() => act.mutate("confirm")} />
          ) : null}

          <View>
            <View style={styles.row}><Feather name="users" size={18} color={colors.brandPrimary} /><Text style={styles.rowText}>Party of {r.party_size} · ~{r.duration_minutes} min</Text></View>
            {r.occasion ? <View style={styles.row}><Feather name="gift" size={18} color={colors.brandPrimary} /><Text style={styles.rowText}>{r.occasion}</Text></View> : null}
            {r.seating_preference ? <View style={styles.row}><Feather name="map-pin" size={18} color={colors.brandPrimary} /><Text style={styles.rowText}>{r.seating_preference} seating</Text></View> : null}
            {r.special_requests ? <View style={styles.row}><Feather name="message-square" size={18} color={colors.brandPrimary} /><Text style={styles.rowText}>{r.special_requests}</Text></View> : null}
            {r.deposit?.required ? <View style={styles.row}><Feather name="credit-card" size={18} color={colors.brandPrimary} /><Text style={styles.rowText}>Deposit {money(r.deposit.amount)}</Text><Tag label={r.deposit.status.replace("_simulated", "")} /></View> : null}
          </View>

          <View style={styles.policy}>
            <Text style={styles.policyTitle}>Reminders & policy</Text>
            <Text style={styles.policyBody}>We&apos;ll remind you 24 hours and 2 hours before arrival. Free changes or cancellation up to {r.cancellation_cutoff_hours} hours before your reservation{r.deposit?.required ? "; late cancellations forfeit the deposit" : ""}. Your occasion, seating and requests are shared with the host before seating.</Text>
          </View>

          {live ? (
            <>
              <Divider />
              <View style={styles.modify}>
                <View style={styles.between}>
                  <Text style={styles.h2}>Change party size</Text>
                  <Stepper testID="reservation-party-stepper" value={party ?? r.party_size} onChange={setParty} min={1} max={20} />
                </View>
                {party !== null && party !== r.party_size ? <Button testID="reservation-save-button" title={`Update to ${party} guests`} variant="secondary" loading={modify.isPending} onPress={() => modify.mutate()} /> : null}
              </View>
              <Divider />
              {r.status === "confirmed" ? <Button testID="reservation-checkin-button" title="I've arrived — check in" icon="log-in" onPress={() => act.mutate("check-in")} /> : null}
              <Button testID="reservation-cancel-button" title="Cancel reservation" variant="ghost" onPress={() => act.mutate("cancel")} />
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
