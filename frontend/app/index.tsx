import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/src/auth-context";
import { useOutlet } from "@/src/outlet-context";
import { makeStyles, useTheme } from "@/src/theme";

const useStyles = makeStyles((colors) => ({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
}));

export default function Index() {
  const { guest, ready } = useAuth();
  const outlet = useOutlet();
  const styles = useStyles();
  const { colors } = useTheme();

  if (!ready || !outlet.ready) {
    return (
      <View style={styles.center} testID="app-loading">
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }
  if (!guest) return <Redirect href="/(auth)/login" />;
  if (!outlet.outletId) return <Redirect href="/outlets" />;
  return <Redirect href="/(tabs)" />;
}
