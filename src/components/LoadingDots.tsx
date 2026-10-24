import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../constants/theme';

interface LoadingDotsProps {
  /** Dot diameter. Use ~10 for the main loader, ~5 for inline hints. */
  size?: number;
  /** Optional caption under the dots. */
  label?: string;
  color?: string;
}

const DOTS = 3;
const STEP_MS = 160;
const PULSE_MS = 420;

/**
 * Three dots that rise and brighten in a gentle wave. Lightweight,
 * native-driven, and calm enough to sit on the home screen.
 */
export function LoadingDots({
  size = 10,
  label,
  color = colors.accent,
}: LoadingDotsProps) {
  const values = useRef(
    Array.from({ length: DOTS }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const wave = Animated.loop(
      Animated.stagger(
        STEP_MS,
        values.map(value =>
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: PULSE_MS,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: PULSE_MS,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    );
    wave.start();
    return () => wave.stop();
  }, [values]);

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Loading'}
    >
      <View style={[styles.row, { gap: size * 0.8, height: size * 2.4 }]}>
        {values.map((value, index) => (
          <Animated.View
            key={index}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              opacity: value.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  translateY: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -size * 0.7],
                  }),
                },
                {
                  scale: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1.1],
                  }),
                },
              ],
            }}
          />
        ))}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    marginTop: spacing.lg,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
});
