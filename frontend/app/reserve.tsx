import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { Button, Chip, ChipRow, Divider, Field, ScreenHeader, Stepper } from "@/src/components/ui";
import { fonts, fontSize, hhmmTo12, spacing, ymd } from "@/src/format";
import { useOutlet } from "@/src/outlet-context";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

const OCCASIONS = ["Birthday", "Anniversary", "Business", "Date night", "Family"];
const SEATING = ["Window", "Booth", "Quiet corner", "Bar", "Outdoor"];

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md },
  h: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  sub: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted, lineHeight: 20 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  slot: { width: "30%", flexGrow: 1, height: 44, borderWidth: 1, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  slotOn: { backgroundColor: colors.onSurface, borderColor: colors.onSurface },
  slotOff: { opacity: 0.35 },
  slotText: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurface },
  slotTextOn: { color: colors.onSurfaceInverse },
  hot: { position: "absolute", top: 3, right: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brandPrimary },
  legend: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  sticky: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.divider, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  waitBox: { backgroundColor: colors.surfaceSecondary, padding: spacing.lg, gap: spacing.md },
}));

export default function Reserve() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { outletId, outlet } = useOutlet();

  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }), []);
  const [date, setDate] = useState(ymd(days[0]));
  const [party, setParty] = useState(2);
  const [time, setTime] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [seating, setSeating] = useState<string | null>(null);
  const [requests, setRequests] = useState("");

  const avail = useQuery({
    queryKey: ["availability", outletId, date, party],
    queryFn: () => api(`/outlets/${outletId}/reservations/availability?date=${date}&party_size=${party}`),
    enabled: !!outletId,
  });

  const create = useMutation({
    mutationFn: () => api("/reservations", { method: "POST", body: { outlet_id: outletId, date, time, party_size: party, occasion, seating_preference: seating, special_requests: requests.trim() || null } }),
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.show(r.status === "confirmed" ? "Reservation confirmed" : "Slot held — confirm to keep it", "success");
      router.replace(`/reservation/${r.id}`);
    },
    onError: (e: any) => { toast.show(e.message, "error"); avail.refetch(); },
  });

  const joinWaitlist = useMutation({
    mutationFn: () => api("/waitlist", { method: "POST", body: { outlet_id: outletId, party_size: party, seating_preference: seating } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waitlist"] });
      toast.show("You're on the waitlist", "success");
      router.replace("/(tabs)/orders");
    },
    onError: (e: any) => toast.show(e.message, "error"),
  });

  const ctaHeight = 84 + insets.bottom;
  const supportsReservation = outlet?.services.includes("reservation");

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="reserve-screen">
      <ScreenHeader title="Reserve a table" onBack={() => router.back()} />
      <KeyboardAwareScrollView bottomOffset={ctaHeight + spacing.lg} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: ctaHeight + spacing.xl }}>
        <View style={styles.section}>
          <Text style={styles.h}>{outlet?.name}</Text>
          <Text style={styles.sub}>{outlet?.address}</Text>
          {!supportsReservation ? <Text style={[styles.sub, { color: colors.error }]}>This outlet does not take reservations. Change outlet from the menu screen.</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.h}>Date</Text>
        </View>
        <ChipRow testID="reserve-date-chips">
          {days.map((d, i) => (
            <Chip key={ymd(d)} testID={`date-chip-${i}`} label={i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} selected={date === ymd(d)} onPress={() => { setDate(ymd(d)); setTime(null); }} />
          ))}
        </ChipRow>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.h}>Party size</Text>
            <Stepper testID="reserve-party-stepper" value={party} onChange={(v) => { setParty(v); setTime(null); }} min={1} max={20} />
          </View>
          {avail.data?.deposit_required ? <Text style={styles.sub}>Parties of 8+ hold a refundable $25/guest deposit. Free cancellation up to 2 hours before.</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.h}>Time</Text>
          {avail.isLoading ? (
            <ActivityIndicator color={colors.brandPrimary} />
          ) : (
            <>
              <View style={styles.slots} testID="reserve-slots">
                {(avail.data?.slots ?? []).map((s: any) => (
                  <Pressable key={s.time} testID={`slot-${s.time.replace(":", "")}`} disabled={!s.available} accessibilityRole="button" accessibilityState={{ selected: time === s.time, disabled: !s.available }} style={[styles.slot, time === s.time && styles.slotOn, !s.available && styles.slotOff]} onPress={() => setTime(s.time)}>
                    <Text style={[styles.slotText, time === s.time && styles.slotTextOn]}>{hhmmTo12(s.time)}</Text>
                    {s.high_demand && s.available ? <View style={styles.hot} /> : null}
                  </Pressable>
                ))}
              </View>
              <Text style={styles.legend}>• High-demand slots are held for 10 minutes and need a one-tap confirmation. Duration ~{avail.data?.slots?.[0]?.duration_minutes ?? 90} min.</Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.h}>Occasion</Text>
        </View>
        <ChipRow testID="reserve-occasion-chips">
          {OCCASIONS.map((o) => <Chip key={o} testID={`occasion-chip-${o}`} label={o} selected={occasion === o} onPress={() => setOccasion(occasion === o ? null : o)} />)}
        </ChipRow>
        <View style={styles.section}>
          <Text style={styles.h}>Seating preference</Text>
        </View>
        <ChipRow testID="reserve-seating-chips">
          {SEATING.map((o) => <Chip key={o} testID={`seating-chip-${o}`} label={o} selected={seating === o} onPress={() => setSeating(seating === o ? null : o)} />)}
        </ChipRow>

        <View style={styles.section}>
          <Field testID="reserve-requests-input" label="Special requests" value={requests} onChangeText={setRequests} placeholder="High chair, allergies, surprise dessert…" multiline />
        </View>

        <View style={styles.section}>
          <Divider />
          <View style={styles.waitBox} testID="reserve-waitlist-box">
            <Text style={styles.h}>Nearby right now?</Text>
            <Text style={styles.sub}>Skip the booking and join the virtual waitlist. We&apos;ll text you when your table is ready.</Text>
            <Button testID="reserve-join-waitlist-button" title={`Join waitlist · party of ${party}`} variant="secondary" loading={joinWaitlist.isPending} onPress={() => joinWaitlist.mutate()} />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.sticky, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button testID="reserve-submit-button" title={time ? `Reserve ${hhmmTo12(time)} · ${party} guests` : "Choose a time"} disabled={!time || !supportsReservation} loading={create.isPending} onPress={() => create.mutate()} />
      </View>
    </View>
  );
}
