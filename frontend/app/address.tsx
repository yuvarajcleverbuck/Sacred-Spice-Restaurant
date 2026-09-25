import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { useAuth } from "@/src/auth-context";
import { Button, Field, ScreenHeader } from "@/src/components/ui";
import { spacing } from "@/src/format";
import { makeStyles } from "@/src/theme";
import { useToast } from "@/src/toast";

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  body: { padding: spacing.xl, gap: spacing.lg },
}));

export default function AddAddress() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { refreshProfile } = useAuth();
  const [f, setF] = useState({ label: "Home", line1: "", line2: "", city: "", state: "NY", zip: "", instructions: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setError(null);
    if (!f.line1.trim() || !f.city.trim() || !/^\d{5}$/.test(f.zip.trim())) return setError("Street, city and a 5-digit ZIP are required");
    setBusy(true);
    try {
      await api("/guest/addresses", { method: "POST", body: { ...f, line2: f.line2 || null, instructions: f.instructions || null, zip: f.zip.trim() } });
      await refreshProfile();
      toast.show("Address saved", "success");
      router.back();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="address-screen">
      <ScreenHeader title="New address" onBack={() => router.back()} />
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.body}>
          <Field testID="address-label-input" label="Label" value={f.label} onChangeText={set("label")} placeholder="Home, Work…" />
          <Field testID="address-line1-input" label="Street address" value={f.line1} onChangeText={set("line1")} placeholder="123 Amsterdam Ave" />
          <Field testID="address-line2-input" label="Apt / floor (optional)" value={f.line2} onChangeText={set("line2")} placeholder="Apt 4B" />
          <Field testID="address-city-input" label="City" value={f.city} onChangeText={set("city")} placeholder="New York" />
          <Field testID="address-state-input" label="State" value={f.state} onChangeText={set("state")} placeholder="NY" autoCapitalize="characters" maxLength={2} />
          <Field testID="address-zip-input" label="ZIP" value={f.zip} onChangeText={set("zip")} placeholder="10024" keyboardType="number-pad" maxLength={5} error={error} />
          <Field testID="address-instructions-input" label="Delivery instructions (optional)" value={f.instructions} onChangeText={set("instructions")} placeholder="Ring bell twice" />
          <Button testID="address-save-button" title="Save address" onPress={save} loading={busy} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
