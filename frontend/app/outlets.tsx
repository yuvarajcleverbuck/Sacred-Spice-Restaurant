import Feather from "@react-native-vector-icons/feather";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { Button, ScreenHeader, Tag } from "@/src/components/ui";
import { fonts, fontSize, SERVICE_LABELS, spacing } from "@/src/format";
import { Outlet, useOutlet } from "@/src/outlet-context";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  intro: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  lead: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted, lineHeight: 22 },
  locRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  locText: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.brandPrimary },
  card: { marginHorizontal: spacing.lg, marginTop: spacing.lg, height: 220, backgroundColor: colors.surfaceTertiary },
  cardSelected: { borderWidth: 2, borderColor: colors.brandPrimary },
  img: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 170 },
  text: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg, gap: spacing.xs },
  name: { fontFamily: fonts.display, fontSize: fontSize["2xl"], color: colors.onSurfaceInverse },
  tagline: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurfaceInverse, opacity: 0.85 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap", marginTop: spacing.xs },
  status: { fontFamily: fonts.textMedium, fontSize: fontSize.sm, color: colors.onSurfaceInverse },
  open: { color: colors.brandSecondary },
  services: { flexDirection: "row", gap: spacing.xs, flexWrap: "wrap", marginTop: spacing.xs },
  check: { position: "absolute", top: spacing.md, right: spacing.md, width: 32, height: 32, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  distance: { position: "absolute", top: spacing.md, left: spacing.md, backgroundColor: colors.surface, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  distanceText: { fontFamily: fonts.textMedium, fontSize: fontSize.sm, color: colors.onSurface },
  settings: { backgroundColor: colors.surfaceSecondary, marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.lg, gap: spacing.md },
  settingsText: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurfaceSecondary, lineHeight: 20 },
}));

export default function Outlets() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { outletId, selectOutlet } = useOutlet();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locState, setLocState] = useState<"idle" | "asking" | "denied" | "blocked" | "granted">("idle");

  const q = useQuery({
    queryKey: ["outlets", coords],
    queryFn: () => api<Outlet[]>(coords ? `/outlets?lat=${coords.lat}&lng=${coords.lng}` : "/outlets"),
  });

  const useLocation = async () => {
    setLocState("asking");
    try {
      const existing = await Location.getForegroundPermissionsAsync();
      let status = existing.status;
      let canAskAgain = existing.canAskAgain;
      if (status !== "granted") {
        if (!canAskAgain) {
          setLocState("blocked");
          return;
        }
        const r = await Location.requestForegroundPermissionsAsync();
        status = r.status;
        canAskAgain = r.canAskAgain;
      }
      if (status !== "granted") {
        setLocState(canAskAgain ? "denied" : "blocked");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setLocState("granted");
    } catch {
      setLocState("denied");
      toast.show("Couldn't read your location. Choose an outlet manually.", "error");
    }
  };

  const choose = async (o: Outlet) => {
    await selectOutlet(o.id);
    toast.show(`Now ordering from ${o.name}`, "success");
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="outlets-screen">
      <ScreenHeader title="Choose your outlet" onBack={router.canGoBack() ? () => router.back() : undefined} />
      <FlatList
        data={q.data ?? []}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Text style={styles.lead}>Menus, hours and delivery areas are specific to each outlet. Your selection carries through to ordering and reservations.</Text>
            {locState === "asking" ? (
              <ActivityIndicator color={colors.brandPrimary} />
            ) : locState === "blocked" ? (
              <View style={styles.settings} testID="location-blocked-card">
                <Text style={styles.settingsText}>Location access is turned off for Sacred Spice. Enable it in Settings to see nearby outlets, or simply pick one below.</Text>
                <Button testID="location-open-settings" title="Open Settings" variant="secondary" icon="settings" onPress={() => Linking.openSettings()} />
              </View>
            ) : locState === "granted" ? (
              <View style={styles.locRow}>
                <Feather name="navigation" size={16} color={colors.success} />
                <Text style={[styles.locText, { color: colors.success }]}>Sorted by distance from you</Text>
              </View>
            ) : (
              <Pressable testID="outlets-use-location" style={styles.locRow} onPress={useLocation} accessibilityRole="button">
                <Feather name="navigation" size={16} color={colors.brandPrimary} />
                <Text style={styles.locText}>{locState === "denied" ? "Try location again to sort by distance" : "Use my location to find the nearest outlet"}</Text>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={q.isLoading ? <ActivityIndicator style={{ marginTop: spacing["2xl"] }} color={colors.brandPrimary} /> : null}
        renderItem={({ item: o }) => (
          <Pressable testID={`outlet-card-${o.id}`} accessibilityRole="button" style={[styles.card, o.id === outletId && styles.cardSelected]} onPress={() => choose(o)}>
            <Image source={{ uri: o.image }} style={styles.img} contentFit="cover" transition={300} />
            <LinearGradient colors={[colors.scrimTransparent, colors.scrim]} style={styles.scrim} />
            {o.distance_miles !== undefined ? (
              <View style={styles.distance}>
                <Text style={styles.distanceText}>{o.distance_miles} mi</Text>
              </View>
            ) : null}
            {o.id === outletId ? (
              <View style={styles.check} testID="outlet-selected-check">
                <Feather name="check" size={18} color={colors.onBrandPrimary} />
              </View>
            ) : null}
            <View style={styles.text}>
              <Text style={styles.name}>{o.name}</Text>
              <Text style={styles.tagline}>{o.address}</Text>
              <View style={styles.row}>
                <Text style={[styles.status, o.is_open && styles.open]}>{o.is_open ? "Open now" : "Closed"}</Text>
                <Text style={styles.status}>· {o.hours.mon.open === "00:00" ? "All-day kitchen" : `${o.hours.mon.open}–${o.hours.mon.close}`}</Text>
              </View>
              <View style={styles.services}>
                {o.services.map((s) => (
                  <Tag key={s} label={SERVICE_LABELS[s] ?? s} />
                ))}
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
