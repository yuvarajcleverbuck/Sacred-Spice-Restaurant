import Feather from "@react-native-vector-icons/feather";
import { Redirect, Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

import { useAuth } from "@/src/auth-context";
import { fonts } from "@/src/format";
import { usesNativeTabs } from "@/src/navigation";
import { useTheme } from "@/src/theme";

const TABS = [
  { name: "index", label: "Menu", icon: "book-open", sf: "book.fill" },
  { name: "orders", label: "Orders", icon: "clock", sf: "clock.fill" },
  { name: "rewards", label: "Rewards", icon: "award", sf: "star.fill" },
  { name: "profile", label: "Profile", icon: "user", sf: "person.fill" },
] as const;

export default function TabsLayout() {
  const { colors } = useTheme();
  const { guest, ready } = useAuth();
  if (ready && !guest) return <Redirect href="/(auth)/login" />;

  if (usesNativeTabs) {
    return (
      <NativeTabs tintColor={colors.brandPrimary}>
        {TABS.map((t) => (
          <NativeTabs.Trigger key={t.name} name={t.name}>
            <NativeTabs.Trigger.Icon sf={t.sf as any} />
            <NativeTabs.Trigger.Label>{t.label}</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          ...(Platform.OS === "web" ? { height: 64 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontFamily: fonts.textMedium, fontSize: 11, letterSpacing: 0.4 },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.label,
            tabBarButtonTestID: `tab-${t.name}`,
            tabBarIcon: ({ color, focused }) => <Feather name={t.icon} size={focused ? 23 : 22} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
