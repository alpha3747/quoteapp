import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radii, spacing } from '../constants/theme';

interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastState extends ToastOptions {
  key: number;
}

interface ToastContextValue {
  show: (options: ToastOptions | string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Minimal, dependency-free toast system. Shows one message at a time
 * near the bottom of the screen with an optional action (e.g. "Undo").
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counter = useRef(0);

  const show = useCallback((options: ToastOptions | string) => {
    const normalized =
      typeof options === 'string' ? { message: options } : options;
    counter.current += 1;
    setToast({ ...normalized, key: counter.current });
    AccessibilityInfo.announceForAccessibility?.(normalized.message);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <ToastView
          key={toast.key}
          toast={toast}
          onHide={() =>
            setToast(current => (current?.key === toast.key ? null : current))
          }
        />
      ) : null}
    </ToastContext.Provider>
  );
}

function ToastView({
  toast,
  onHide,
}: {
  toast: ToastState;
  onHide: () => void;
}) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;

  const hide = useCallback(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => onHide());
  }, [onHide, progress]);

  useEffect(() => {
    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
    const timer = setTimeout(hide, toast.durationMs ?? 2600);
    return () => clearTimeout(timer);
  }, [hide, progress, toast.durationMs]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        { bottom: insets.bottom + 110 },
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.toast} accessibilityLiveRegion="polite">
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.actionLabel && toast.onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              toast.onAction?.();
              hide();
            }}
            hitSlop={8}
          >
            <Text style={styles.action}>{toast.actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    maxWidth: 420,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg + 2,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  message: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.sans,
  },
  action: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
