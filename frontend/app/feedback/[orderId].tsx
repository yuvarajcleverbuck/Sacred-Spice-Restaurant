import Feather from "@react-native-vector-icons/feather";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { Button, Chip, Field, ScreenHeader, haptic } from "@/src/components/ui";
import { fonts, fontSize, spacing } from "@/src/format";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

const TAGS = ["Food quality", "Spice level", "Packaging", "Wait time", "Service", "Value"];

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  body: { padding: spacing.xl, gap: spacing.xl },
  h1: { fontFamily: fonts.display, fontSize: fontSize["3xl"], color: colors.onSurface, lineHeight: 38 },
  sub: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted, lineHeight: 22 },
  h2: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },
  stars: { flexDirection: "row", gap: spacing.sm },
  star: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, gap: spacing.md },
  itemName: { flex: 1, fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurface },
  miniStars: { flexDirection: "row", gap: 2 },
  miniStar: { width: 30, height: 36, alignItems: "center", justifyContent: "center" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  thanks: { alignItems: "center", gap: spacing.lg, paddingVertical: spacing["3xl"] },
}));

export default function Feedback() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [rating, setRating] = useState(0);
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [result, setResult] = useState<any>(null);

  const order = useQuery({ queryKey: ["order", orderId], queryFn: () => api(`/orders/${orderId}`) });
  const submit = useMutation({
    mutationFn: () => api("/feedback", { method: "POST", body: { order_id: orderId, rating, item_ratings: itemRatings, comment: comment.trim() || null, tags } }),
    onSuccess: (r) => {
      setResult(r);
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", orderId] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: any) => toast.show(e.message, "error"),
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="feedback-screen">
      <ScreenHeader title="Your feedback" onBack={() => router.back()} />
      {result ? (
        <View style={styles.thanks} testID="feedback-thanks">
          <Feather name={result.service_recovery_case_id ? "life-buoy" : "heart"} size={40} color={colors.brandPrimary} />
          <Text style={styles.h1}>{result.service_recovery_case_id ? "We'll make it right" : "Thank you"}</Text>
          <Text style={[styles.sub, { textAlign: "center", paddingHorizontal: spacing.xl }]}>
            {result.service_recovery_case_id
              ? "A manager has been assigned to your case and will respond in-app within 24 hours."
              : "Your private feedback helps our kitchen and team improve every visit."}
          </Text>
          {result.invite_public_review ? (
            <Button testID="feedback-public-review-button" title="Share a public review" variant="secondary" icon="external-link" onPress={() => toast.show("Public review link will open your preferred review platform", "info")} />
          ) : null}
          <Button testID="feedback-done-button" title="Done" onPress={() => router.replace("/(tabs)/orders")} />
        </View>
      ) : !order.data ? (
        <ActivityIndicator style={{ marginTop: spacing["2xl"] }} color={colors.brandPrimary} />
      ) : (
        <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
          <View style={styles.body}>
            <View style={{ gap: spacing.xs }}>
              <Text style={styles.h1}>How was {order.data.number}?</Text>
              <Text style={styles.sub}>{order.data.outlet_name} · shared privately with the team first.</Text>
            </View>
            <View style={styles.stars} testID="feedback-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} testID={`feedback-star-${s}`} accessibilityRole="button" style={styles.star} onPress={() => { haptic("light"); setRating(s); }}>
                  <Feather name="star" size={34} color={s <= rating ? colors.brandSecondary : colors.borderStrong} />
                </Pressable>
              ))}
            </View>
            <View style={{ gap: spacing.sm }}>
              <Text style={styles.h2}>Rate the dishes</Text>
              {order.data.items.map((l: any) => (
                <View key={l.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>{l.name}</Text>
                  <View style={styles.miniStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Pressable key={s} testID={`item-star-${l.item_id}-${s}`} style={styles.miniStar} onPress={() => setItemRatings((r) => ({ ...r, [l.item_id]: s }))}>
                        <Feather name="star" size={18} color={s <= (itemRatings[l.item_id] ?? 0) ? colors.brandSecondary : colors.borderStrong} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>
            <View style={{ gap: spacing.sm }}>
              <Text style={styles.h2}>What stood out?</Text>
              <View style={styles.tags}>
                {TAGS.map((t) => <Chip key={t} testID={`feedback-tag-${t}`} label={t} selected={tags.includes(t)} onPress={() => setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))} />)}
              </View>
            </View>
            <Field testID="feedback-comment-input" label="Comments (optional)" value={comment} onChangeText={setComment} placeholder="Tell us more…" multiline />
            <Button testID="feedback-submit-button" title="Submit feedback" disabled={!rating} loading={submit.isPending} onPress={() => submit.mutate()} />
          </View>
        </KeyboardAwareScrollView>
      )}
    </View>
  );
}
