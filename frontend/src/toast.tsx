import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts, fontSize, spacing } from "@/src/format";
import { makeStyles } from "@/src/theme";

type ToastType = "info" | "success" | "error";
type Toast = { id: number; message: string; type: ToastType };

const ToastContext = createContext<{ show: (message: string, type?: ToastType) => void } | null>(null);

const useStyles = makeStyles((colors) => ({
  wrap: { position: "absolute", left: spacing.lg, right: spacing.lg, alignItems: "stretch" },
  toast: {
    backgroundColor: colors.surfaceInverse,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
  },
  info: { borderLeftColor: colors.brandSecondary },
  success: { borderLeftColor: colors.success },
  error: { borderLeftColor: colors.brandPrimary },
  text: { color: colors.onSurfaceInverse, fontFamily: fonts.textMedium, fontSize: fontSize.base },
}));

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={[styles.wrap, { top: insets.top + spacing.sm, pointerEvents: "none" }]}>
        {toasts.map((t) => (
          <Animated.View
            key={t.id}
            entering={FadeInUp.duration(220)}
            exiting={FadeOutUp.duration(180)}
            style={[styles.toast, styles[t.type]]}
            testID={`toast-${t.type}`}
          >
            <Text style={styles.text}>{t.message}</Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast outside ToastProvider");
  return ctx;
}
