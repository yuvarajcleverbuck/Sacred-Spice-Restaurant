import Feather from "@react-native-vector-icons/feather";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { fonts, fontSize, spacing } from "@/src/format";
import { makeStyles, useTheme } from "@/src/theme";

type IconName = React.ComponentProps<typeof Feather>["name"];

const haptic = (style: "light" | "medium" | "selection" = "light") => {
  if (Platform.OS === "web") return;
  if (style === "selection") Haptics.selectionAsync();
  else Haptics.impactAsync(style === "light" ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
};

const useStyles = makeStyles((colors) => ({
  btn: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  btnPrimary: { backgroundColor: colors.brandPrimary },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.onSurface },
  btnGhost: { backgroundColor: colors.surface },
  btnDisabled: { opacity: 0.45 },
  btnPressed: { opacity: 0.82 },
  btnTextPrimary: { color: colors.onBrandPrimary, fontFamily: fonts.textSemiBold, fontSize: fontSize.lg, letterSpacing: 0.2 },
  btnTextSecondary: { color: colors.onSurface, fontFamily: fonts.textSemiBold, fontSize: fontSize.lg },
  btnTextGhost: { color: colors.brandPrimary, fontFamily: fonts.textSemiBold, fontSize: fontSize.base },

  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    flexShrink: 0,
    borderRadius: 999,
  },
  chipSelected: { borderColor: colors.brandPrimary, backgroundColor: colors.brandPrimary },
  chipText: { color: colors.onSurface, fontFamily: fonts.textMedium, fontSize: fontSize.base },
  chipTextSelected: { color: colors.onBrandPrimary },
  chipRow: { height: 56 },
  chipRowContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: "center" },

  sectionTitle: { fontFamily: fonts.display, fontSize: fontSize["2xl"], color: colors.onSurface },
  sectionKicker: {
    fontFamily: fonts.textMedium,
    fontSize: fontSize.sm,
    color: colors.brandPrimary,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  divider: { height: 1, backgroundColor: colors.divider },

  inputWrap: { gap: spacing.xs },
  inputLabel: { fontFamily: fonts.textMedium, fontSize: fontSize.sm, color: colors.muted, letterSpacing: 0.6, textTransform: "uppercase" },
  input: {
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    paddingVertical: spacing.md,
    fontFamily: fonts.text,
    fontSize: fontSize.lg,
    color: colors.onSurface,
  },
  inputMulti: { minHeight: 84, textAlignVertical: "top" },
  inputError: { fontFamily: fonts.text, fontSize: fontSize.sm, color: colors.error },

  empty: { alignItems: "center", paddingVertical: spacing["3xl"], paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyTitle: { fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface, textAlign: "center" },
  emptyBody: { fontFamily: fonts.text, fontSize: fontSize.base, color: colors.muted, textAlign: "center", lineHeight: 22 },

  stepper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.borderStrong },
  stepBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  stepVal: { minWidth: 36, textAlign: "center", fontFamily: fonts.textSemiBold, fontSize: fontSize.lg, color: colors.onSurface },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    height: 56,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -spacing.sm },
  headerTitle: { flex: 1, fontFamily: fonts.display, fontSize: fontSize.xl, color: colors.onSurface },

  tag: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
  tagText: { fontFamily: fonts.textMedium, fontSize: 11, color: colors.onSurfaceSecondary, letterSpacing: 0.4 },

  spiceRow: { flexDirection: "row", gap: 3, alignItems: "center" },
  spiceDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  spiceDotOn: { backgroundColor: colors.brandPrimary },
}));

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
  style,
  testID,
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: ViewStyle;
  testID?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const textStyle =
    variant === "primary" ? styles.btnTextPrimary : variant === "secondary" ? styles.btnTextSecondary : styles.btnTextGhost;
  const iconColor = variant === "primary" ? colors.onBrandPrimary : variant === "secondary" ? colors.onSurface : colors.brandPrimary;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        haptic("light");
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.btn,
        variant === "primary" ? styles.btnPrimary : variant === "secondary" ? styles.btnSecondary : styles.btnGhost,
        (disabled || loading) && styles.btnDisabled,
        pressed && styles.btnPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={18} color={iconColor} /> : null}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
  testID,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  testID?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        haptic("selection");
        onPress?.();
      }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon ? <Feather name={icon} size={14} color={selected ? colors.onBrandPrimary : colors.onSurface} /> : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children, testID }: { children: React.ReactNode; testID?: string }) {
  const styles = useStyles();
  return (
    <ScrollView
      testID={testID}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipRow}
      contentContainerStyle={styles.chipRowContent}
    >
      {children}
    </ScrollView>
  );
}

export function SectionTitle({ kicker, title, right }: { kicker?: string; title: string; right?: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
      <View style={{ flex: 1 }}>
        {kicker ? <Text style={styles.sectionKicker}>{kicker}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  const styles = useStyles();
  return <View style={[styles.divider, style]} />;
}

export function Field({
  label,
  error,
  multiline,
  testID,
  ...props
}: TextInputProps & { label?: string; error?: string | null }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        testID={testID}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMulti]}
        {...props}
      />
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  testID,
}: {
  icon: IconName;
  title: string;
  body?: string;
  action?: React.ReactNode;
  testID?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.empty} testID={testID}>
      <Feather name={icon} size={36} color={colors.brandTertiary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
      {action}
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
  testID,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  testID?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.stepper} testID={testID}>
      <Pressable
        testID={`${testID}-minus`}
        accessibilityRole="button"
        style={styles.stepBtn}
        onPress={() => {
          haptic("light");
          onChange(Math.max(min, value - 1));
        }}
      >
        <Feather name={value <= min && min === 0 ? "trash-2" : "minus"} size={16} color={colors.onSurface} />
      </Pressable>
      <Text style={styles.stepVal}>{value}</Text>
      <Pressable
        testID={`${testID}-plus`}
        accessibilityRole="button"
        style={styles.stepBtn}
        onPress={() => {
          haptic("light");
          onChange(Math.min(max, value + 1));
        }}
      >
        <Feather name="plus" size={16} color={colors.onSurface} />
      </Pressable>
    </View>
  );
}

export function ScreenHeader({
  title,
  onBack,
  right,
  testID,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  testID?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.header} testID={testID}>
      {onBack ? (
        <Pressable testID="header-back-button" accessibilityRole="button" onPress={onBack} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.onSurface} />
        </Pressable>
      ) : null}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

export function Tag({ label }: { label: string }) {
  const styles = useStyles();
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export function SpiceMeter({ grade }: { grade: number }) {
  const styles = useStyles();
  return (
    <View style={styles.spiceRow} accessibilityLabel={`Spice grade ${grade} of 4`}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.spiceDot, i <= grade && styles.spiceDotOn]} />
      ))}
    </View>
  );
}

export { haptic };
