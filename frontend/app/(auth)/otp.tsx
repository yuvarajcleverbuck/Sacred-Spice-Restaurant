import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth-context";
import { Button, Field, ScreenHeader } from "@/src/components/ui";
import { fonts, fontSize, spacing } from "@/src/format";
import { makeStyles } from "@/src/theme";

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  body: { padding: spacing.xl, gap: spacing.xl },
  title: { fontFamily: fonts.display, fontSize: fontSize["3xl"], color: colors.onSurface, lineHeight: 38 },
  lead: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted, lineHeight: 22 },
  hint: { backgroundColor: colors.surfaceSecondary, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.brandSecondary },
  hintText: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.onSurfaceSecondary, lineHeight: 20 },
  hintCode: { fontFamily: fonts.textSemiBold, color: colors.brandPrimary },
}));

export default function Otp() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email, hint } = useLocalSearchParams<{ email: string; hint?: string }>();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (otp.length !== 6) return setError("Enter the 6-digit code");
    setBusy(true);
    try {
      await verifyOtp(email, otp);
      router.replace("/");
    } catch (e: any) {
      setError(e.message ?? "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="otp-screen">
      <ScreenHeader title="" onBack={() => router.back()} />
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.body}>
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.lead}>We sent a one-time code to {email}.</Text>
          </View>
          {hint ? (
            <View style={styles.hint} testID="otp-dev-hint">
              <Text style={styles.hintText}>
                Development mode — SMS/email delivery is simulated. Your code is <Text style={styles.hintCode}>{hint}</Text>
              </Text>
            </View>
          ) : null}
          <Field
            testID="otp-code-input"
            label="One-time code"
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            placeholder="000000"
            maxLength={6}
            error={error}
            onSubmitEditing={submit}
          />
          <Button testID="otp-submit-button" title="Verify & continue" onPress={submit} loading={busy} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
