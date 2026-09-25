import Feather from "@react-native-vector-icons/feather";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { Button, EmptyState, ScreenHeader } from "@/src/components/ui";
import { fonts, fontSize, formatDateTime, spacing } from "@/src/format";
import { makeStyles, useTheme } from "@/src/theme";

const ICONS: Record<string, string> = { order: "shopping-bag", reservation: "calendar", waitlist: "users", receipt: "file-text", feedback: "star", general: "bell", promo: "tag" };

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  row: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider },
  unread: { backgroundColor: colors.surfaceSecondary },
  icon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceTertiary },
  title: { fontFamily: fonts.textMedium, fontSize: fontSize.base, color: colors.onSurface },
  body: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted, lineHeight: 20, marginTop: 2 },
  time: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary, marginTop: 6 },
}));

export default function Notifications() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications"], queryFn: () => api("/notifications") });
  const readAll = useMutation({ mutationFn: () => api("/notifications/read-all", { method: "POST" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const readOne = useMutation({ mutationFn: (id: string) => api(`/notifications/${id}/read`, { method: "PATCH" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });

  const open = (n: any) => {
    if (!n.read) readOne.mutate(n.id);
    if (n.ref?.action === "feedback" && n.ref.order_id) router.push(`/feedback/${n.ref.order_id}`);
    else if (n.ref?.order_id) router.push(`/order/${n.ref.order_id}`);
    else if (n.ref?.reservation_id) router.push(`/reservation/${n.ref.reservation_id}`);
    else if (n.ref?.waitlist_id) router.push("/(tabs)/orders");
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="notifications-screen">
      <ScreenHeader
        title="Notifications"
        onBack={() => router.back()}
        right={q.data?.unread ? <Button testID="notifications-read-all" title="Mark all read" variant="ghost" style={{ minHeight: 40, paddingHorizontal: spacing.sm }} onPress={() => readAll.mutate()} /> : null}
      />
      {q.isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing["2xl"] }} color={colors.brandPrimary} />
      ) : (
        <FlatList
          data={q.data?.items ?? []}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          ListEmptyComponent={<EmptyState icon="bell" title="All quiet" body="Order updates, reservation reminders and offers will arrive here." />}
          renderItem={({ item: n }) => (
            <Pressable testID={`notification-${n.id}`} style={[styles.row, !n.read && styles.unread]} onPress={() => open(n)}>
              <View style={styles.icon}><Feather name={(ICONS[n.category] ?? "bell") as any} size={16} color={colors.brandPrimary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{n.title}</Text>
                <Text style={styles.body}>{n.body}</Text>
                <Text style={styles.time}>{formatDateTime(n.created_at)}</Text>
              </View>
              {!n.read ? <View style={styles.dot} /> : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
