import { useRouter } from "expo-router";
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
}));

export default function Register() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError("Please tell us your name");
    if (!email.includes("@")) return setError("Enter a valid email address");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    setBusy(true);
    try {
      const r = await register({ email: email.trim(), password, name: name.trim(), mobile: mobile.trim() || undefined });
      router.push({ pathname: "/(auth)/otp", params: { email: email.trim(), hint: r.dev_otp ?? "" } });
    } catch (e: any) {
      setError(e.message ?? "Unable to register");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="register-screen">
      <ScreenHeader title="" onBack={() => router.back()} />
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.body}>
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.title}>Create your{"\n"}guest account</Text>
            <Text style={styles.lead}>We&apos;ll send a one-time code to verify your details. Guest checkout stays available too.</Text>
          </View>
          <Field testID="register-name-input" label="Full name" value={name} onChangeText={setName} placeholder="Priya Sharma" autoComplete="name" />
          <Field
            testID="register-email-input"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Field testID="register-mobile-input" label="Mobile (optional)" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholder="+1 212 555 0100" />
          <Field
            testID="register-password-input"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 8 characters"
            error={error}
            onSubmitEditing={submit}
            returnKeyType="go"
          />
          <Button testID="register-submit-button" title="Continue" onPress={submit} loading={busy} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
