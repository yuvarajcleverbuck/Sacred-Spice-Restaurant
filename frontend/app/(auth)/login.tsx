import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth-context";
import { Button, Field } from "@/src/components/ui";
import { fonts, fontSize, spacing } from "@/src/format";
import { makeStyles, useTheme } from "@/src/theme";
import { useToast } from "@/src/toast";

const HERO = "https://images.pexels.com/photos/29962487/pexels-photo-29962487.jpeg?auto=compress&cs=tinysrgb&w=1200";

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: { height: 300, width: "100%" },
  heroImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 220 },
  heroText: { position: "absolute", left: spacing.xl, right: spacing.xl, bottom: spacing.xl },
  kicker: { color: colors.brandSecondary, fontFamily: fonts.textMedium, fontSize: fontSize.sm, letterSpacing: 2, textTransform: "uppercase" },
  title: { color: colors.onSurfaceInverse, fontFamily: fonts.display, fontSize: 38, marginTop: spacing.xs, lineHeight: 44 },
  body: { padding: spacing.xl, gap: spacing.xl },
  lead: { fontFamily: fonts.text, fontSize: fontSize.lg, color: colors.muted, lineHeight: 24 },
  footer: { flexDirection: "row", justifyContent: "center", gap: spacing.xs, paddingVertical: spacing.lg },
  footerText: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted },
  footerLink: { fontFamily: fonts.textSemiBold, fontSize: fontSize.base, color: colors.brandPrimary },
}));

export default function Login() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.includes("@")) return setError("Enter a valid email address");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      if (e.status === 403) {
        toast.show("Please verify your email first");
        router.push({ pathname: "/(auth)/otp", params: { email: email.trim() } });
      } else setError(e.message ?? "Unable to sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root} testID="login-screen">
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.hero}>
          <Image source={{ uri: HERO }} style={styles.heroImg} contentFit="cover" transition={300} />
          <LinearGradient colors={[colors.scrimTransparent, colors.scrim]} style={styles.scrim} />
          <View style={styles.heroText}>
            <Text style={styles.kicker}>Sacred Spice</Text>
            <Text style={styles.title}>Welcome back,{"\n"}dinner awaits</Text>
          </View>
        </View>
        <View style={styles.body}>
          <Text style={styles.lead}>Sign in to order, reserve a table and earn points on every visit.</Text>
          <Field
            testID="login-email-input"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Field
            testID="login-password-input"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            error={error}
            onSubmitEditing={submit}
            returnKeyType="go"
          />
          <Button testID="login-submit-button" title="Sign in" onPress={submit} loading={busy} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>New here?</Text>
            <Pressable testID="login-go-register" onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.footerLink}>Create an account</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
