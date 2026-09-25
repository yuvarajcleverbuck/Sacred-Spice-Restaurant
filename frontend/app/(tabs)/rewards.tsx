import Feather from "@react-native-vector-icons/feather";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { Button, Divider, Tag } from "@/src/components/ui";
import { fonts, fontSize, formatDate, spacing } from "@/src/format";
import { usesNativeTabs } from "@/src/navigation";
import { makeStyles, useTheme } from "@/src/theme";

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider },
  title: { fontFamily: fonts.display, fontSize: fontSize["2xl"] + 4, color: colors.onSurface, paddingTop: spacing.sm },
  body: { padding: spacing.xl, gap: spacing.xl },
  card: { backgroundColor: colors.surfaceInverse, padding: spacing.xl, gap: spacing.sm },
  cardKicker: { fontFamily: fonts.textMedium, fontSize: 11, color: colors.brandSecondary, letterSpacing: 1.6, textTransform: "uppercase" },
  points: { fontFamily: fonts.display, fontSize: 52, color: colors.onSurfaceInverse, lineHeight: 58 },
  pointsLabel: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurfaceInverse, opacity: 0.8 },
  bar: { height: 3, backgroundColor: colors.muted, marginTop: spacing.md },
  barFill: { height: 3, backgroundColor: colors.brandSecondary },
  tierRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xs },
  tierText: { fontFamily: fonts.textMedium, fontSize: fontSize.sm, color: colors.onSurfaceInverse },
  h2: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  reward: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  rewardText: { flex: 1, gap: 2 },
  rewardName: { fontFamily: fonts.textMedium, fontSize: fontSize.lg, color: colors.onSurface },
  rewardDesc: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  rewardPts: { fontFamily: fonts.textSemiBold, fontSize: fontSize.base, color: colors.brandPrimary },
  rewardLocked: { opacity: 0.45 },
  perk: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  perkText: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurface },
  txn: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm, gap: spacing.md },
  txnDesc: { flex: 1, fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurface },
  txnDate: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.muted },
  txnPts: { fontFamily: fonts.textSemiBold, fontSize: fontSize.base, color: colors.success },
  txnNeg: { color: colors.brandPrimary },
  promo: { borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg, gap: spacing.xs, borderStyle: "dashed" },
  promoCode: { fontFamily: fonts.textSemiBold, fontSize: fontSize.lg, color: colors.brandPrimary, letterSpacing: 1.2 },
  promoDesc: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurface },
  empty: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted },
}));

export default function Rewards() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const loyalty = useQuery({ queryKey: ["loyalty"], queryFn: () => api("/loyalty") });
  const promos = useQuery({ queryKey: ["promotions"], queryFn: () => api<any[]>("/promotions/eligible") });
  const l = loyalty.data;
  const progress = l?.next_tier ? Math.min(1, (l.lifetime_points - l.tier.min_points) / (l.next_tier.min_points - l.tier.min_points)) : 1;

  return (
    <View style={styles.root} testID="rewards-screen">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Rewards</Text>
      </View>
      {!l ? (
        <ActivityIndicator style={{ marginTop: spacing["2xl"] }} color={colors.brandPrimary} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xl }}
          refreshControl={<RefreshControl refreshing={loyalty.isRefetching} onRefresh={() => loyalty.refetch()} tintColor={colors.brandPrimary} />}
        >
          <View style={styles.body}>
            <View style={styles.card} testID="loyalty-card">
              <Text style={styles.cardKicker}>{l.tier.name} member</Text>
              <Text style={styles.points} testID="loyalty-points">{l.points.toLocaleString()}</Text>
              <Text style={styles.pointsLabel}>points available · earning {l.earn_rate} pts per $1</Text>
              <View style={styles.bar}><View style={[styles.barFill, { width: `${progress * 100}%` }]} /></View>
              <View style={styles.tierRow}>
                <Text style={styles.tierText}>{l.tier.name}</Text>
                <Text style={styles.tierText}>{l.next_tier ? `${l.points_to_next.toLocaleString()} pts to ${l.next_tier.name}` : "Top tier"}</Text>
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text style={styles.h2}>Your {l.tier.name} perks</Text>
              {l.tier.perks.map((p: string) => (
                <View key={p} style={styles.perk}><Feather name="check" size={16} color={colors.brandTertiary} /><Text style={styles.perkText}>{p}</Text></View>
              ))}
            </View>

            <View style={{ gap: spacing.xs }}>
              <Text style={styles.h2}>Redeem at checkout</Text>
              {l.rewards.map((r: any) => (
                <View key={r.id} style={[styles.reward, !r.redeemable && styles.rewardLocked]} testID={`reward-${r.id}`}>
                  <Feather name={r.redeemable ? "unlock" : "lock"} size={18} color={r.redeemable ? colors.brandPrimary : colors.muted} />
                  <View style={styles.rewardText}>
                    <Text style={styles.rewardName}>{r.name}</Text>
                    <Text style={styles.rewardDesc}>{r.description}</Text>
                  </View>
                  <Text style={styles.rewardPts}>{r.points} pts</Text>
                </View>
              ))}
              <Button testID="rewards-order-button" title="Start an order" variant="secondary" onPress={() => router.push("/(tabs)")} />
            </View>

            <View style={{ gap: spacing.md }}>
              <Text style={styles.h2}>Offers for you</Text>
              {(promos.data ?? []).map((p) => (
                <View key={p.id} style={styles.promo} testID={`promo-${p.code}`}>
                  <Text style={styles.promoCode}>{p.code}</Text>
                  <Text style={styles.promoDesc}>{p.description}</Text>
                  <View style={{ flexDirection: "row", gap: spacing.xs }}>{p.channels.map((c: string) => <Tag key={c} label={c.replace("_", "-")} />)}</View>
                </View>
              ))}
              {promos.data && !promos.data.length ? <Text style={styles.empty}>No offers right now — check back soon.</Text> : null}
            </View>

            <View style={{ gap: spacing.xs }}>
              <Text style={styles.h2}>Activity</Text>
              {l.transactions.length ? l.transactions.map((t: any) => (
                <View key={t.id} style={styles.txn}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txnDesc}>{t.description}</Text>
                    <Text style={styles.txnDate}>{formatDate(t.created_at)}</Text>
                  </View>
                  <Text style={[styles.txnPts, t.points < 0 && styles.txnNeg]}>{t.points > 0 ? "+" : ""}{t.points}</Text>
                </View>
              )) : <Text style={styles.empty}>Points from completed orders will show here.</Text>}
            </View>
            <Divider />
            <Text style={styles.empty}>Tiers: {l.tiers.map((t: any) => `${t.name} (${t.min_points.toLocaleString()}+)`).join(" · ")}. Points expire 12 months after they are earned.</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
