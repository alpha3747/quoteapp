import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ambientPalettes, colors } from '../constants/theme';

interface AmbientBackgroundProps {
  /** Picks the day's palette (e.g. the day of the year). */
  seed: number;
}

/**
 * Calm, abstract backdrop: two large, soft radial "glows" that drift slowly
 * over a dark base, plus a vignette that keeps text readable. The palette
 * changes with the seed so every day feels slightly different.
 * Motion is disabled when the user has "Reduce Motion" turned on.
 */
export function AmbientBackground({ seed }: AmbientBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const palette = ambientPalettes[Math.abs(seed) % ambientPalettes.length];
  const drift = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      drift.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 14000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 14000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, reduceMotion]);

  const size = Math.max(width, height) * 1.1;

  const orb = (color: string) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundImage: `radial-gradient(circle at center, ${color} 0%, transparent 68%)`,
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.base]} pointerEvents="none">
      <Animated.View
        style={[
          styles.orb,
          orb(palette.primary),
          {
            top: -size * 0.42,
            left: -size * 0.38,
            transform: [
              {
                translateX: drift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, width * 0.18],
                }),
              },
              {
                translateY: drift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height * 0.08],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          orb(palette.secondary),
          {
            bottom: -size * 0.5,
            right: -size * 0.45,
            transform: [
              {
                translateX: drift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -width * 0.14],
                }),
              },
              {
                translateY: drift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -height * 0.06],
                }),
              },
            ],
          },
        ]}
      />
      <View style={[StyleSheet.absoluteFill, styles.vignette]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
  vignette: {
    backgroundImage: `linear-gradient(180deg, rgba(14, 17, 16, 0) 0%, rgba(14, 17, 16, 0) 55%, ${colors.background} 100%)`,
  },
});
