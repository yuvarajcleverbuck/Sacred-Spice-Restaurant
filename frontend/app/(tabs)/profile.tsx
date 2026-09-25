import Feather from "@react-native-vector-icons/feather";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { useAuth } from "@/src/auth-context";
import { Button, Chip, Divider } from "@/src/components/ui";
import { ALLERGENS, DIETARY, fonts, fontSize, spacing, spiceLabel } from "@/src/format";
import { usesNativeTabs } from "@/src/navigation";
import { useOutlet } from "@/src/outlet-context";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider },
  title: { fontFamily: fonts.display, fontSize: fontSize["2xl"] + 4, color: colors.onSurface, paddingTop: spacing.sm },
  body: { padding: spacing.xl, gap: spacing.xl },
  name: { fontFamily: fonts.display, fontSize: fontSize["2xl"], color: colors.onSurface },
  meta: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted, lineHeight: 20 },
  h2: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48 },
  rowText: { fontFamily: fonts.text, fontSize: fontSize.lg, color: colors.onSurface, flex: 1 },
  rowSub: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  link: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 52 },
  addr: { paddingVertical: spacing.sm, gap: 2 },
  addrLabel: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurface },
  danger: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.error },
}));

export default function Profile() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { guest, setGuest, logout, refreshProfile } = useAuth();
  const { outlet } = useOutlet();
  const [deleting, setDeleting] = useState(false);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const patch = useMutation({
    mutationFn: (body: any) => api("/guest/profile", { method: "PATCH", body }),
    onSuccess: (g) => setGuest(g),
    onError: (e: any) => toast.show(e.message, "error"),
  });
  const removeAddress = useMutation({
    mutationFn: (id: string) => api(`/guest/addresses/${id}`, { method: "DELETE" }),
    onSuccess: () => refreshProfile(),
  });

  if (!guest) return null;
  const prefs = guest.preferences;
  const toggleList = (key: "dietary" | "allergens", v: string) => {
    const cur = prefs[key] ?? [];
    patch.mutate({ preferences: { [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } });
  };

  return (
    <View style={styles.root} testID="profile-screen">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xl }}>
        <View style={styles.body}>
          <View style={{ gap: spacing.xs }}>
            <Text style={styles.name} testID="profile-name">{guest.name}</Text>
            <Text style={styles.meta}>{guest.email}{guest.mobile ? ` · ${guest.mobile}` : ""}</Text>
            <Text style={styles.meta}>Preferred outlet: {outlet?.name ?? "—"}</Text>
          </View>

          <Pressable testID="profile-notifications-link" style={styles.link} onPress={() => router.push("/notifications")}>
            <Feather name="bell" size={20} color={colors.brandPrimary} />
            <Text style={styles.rowText}>Notifications</Text>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
          <Pressable testID="profile-outlet-link" style={styles.link} onPress={() => router.push("/outlets")}>
            <Feather name="map-pin" size={20} color={colors.brandPrimary} />
            <Text style={styles.rowText}>Change outlet</Text>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
          <Divider />

          <View style={{ gap: spacing.md }}>
            <Text style={styles.h2}>Dietary preferences</Text>
            <View style={styles.chips}>
              {Object.entries(DIETARY).map(([k, v]) => <Chip key={k} testID={`pref-dietary-${k}`} label={v} selected={prefs.dietary.includes(k)} onPress={() => toggleList("dietary", k)} />)}
            </View>
          </View>
          <View style={{ gap: spacing.md }}>
            <Text style={styles.h2}>Allergens to avoid</Text>
            <View style={styles.chips}>
              {Object.entries(ALLERGENS).map(([k, v]) => <Chip key={k} testID={`pref-allergen-${k}`} label={v} selected={prefs.allergens.includes(k)} onPress={() => toggleList("allergens", k)} />)}
            </View>
          </View>
          <View style={{ gap: spacing.md }}>
            <Text style={styles.h2}>Spice preference</Text>
            <View style={styles.chips}>
              {[0, 1, 2, 3, 4].map((g) => <Chip key={g} testID={`pref-spice-${g}`} label={spiceLabel(g)} selected={prefs.spice_preference === g} onPress={() => patch.mutate({ preferences: { spice_preference: g } })} />)}
            </View>
          </View>
          <Divider />

          <View style={{ gap: spacing.sm }}>
            <Text style={styles.h2}>Saved addresses</Text>
            {guest.addresses.map((a) => (
              <View key={a.id} style={[styles.row, styles.addr]} testID={`profile-address-${a.id}`}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addrLabel}>{a.label}</Text>
                  <Text style={styles.rowSub}>{a.line1}, {a.city}, {a.state} {a.zip}</Text>
                </View>
                <Pressable testID={`profile-address-delete-${a.id}`} hitSlop={10} onPress={() => removeAddress.mutate(a.id)} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                  <Feather name="trash-2" size={18} color={colors.muted} />
                </Pressable>
              </View>
            ))}
            <Button testID="profile-add-address-button" title="Add address" variant="ghost" icon="plus" style={{ alignSelf: "flex-start", paddingHorizontal: 0 }} onPress={() => router.push("/address")} />
          </View>
          <Divider />

          <View style={{ gap: spacing.xs }}>
            <Text style={styles.h2}>Marketing consent</Text>
            <Text style={styles.rowSub}>Managed separately per channel. Transactional updates about your orders and reservations are always sent.</Text>
            {(["push", "email", "sms"] as const).map((c) => (
              <View key={c} style={styles.row}>
                <Text style={styles.rowText}>{c === "push" ? "Push notifications" : c === "email" ? "Email" : "SMS"}</Text>
                <Switch testID={`consent-switch-${c}`} value={guest.consents[c]} onValueChange={(v) => patch.mutate({ consents: { [c]: v } })} trackColor={{ true: colors.brandPrimary, false: colors.borderStrong }} thumbColor={colors.surface} />
              </View>
            ))}
          </View>
          <Divider />

          <Button testID="profile-logout-button" title="Sign out" variant="secondary" icon="log-out" onPress={async () => { await logout(); router.replace("/(auth)/login"); }} />
          <Pressable
            testID="profile-delete-account-button"
            style={{ minHeight: 44, justifyContent: "center" }}
            onPress={async () => {
              if (!deleting) { setDeleting(true); toast.show("Tap again to confirm the deletion request", "info"); return; }
              await api("/guest/account/deletion-request", { method: "POST" });
              toast.show("Deletion request submitted", "success");
              await logout();
              router.replace("/(auth)/login");
            }}
          >
            <Text style={styles.danger}>{deleting ? "Confirm account deletion request" : "Request account & data deletion"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
