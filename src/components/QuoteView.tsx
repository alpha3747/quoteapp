import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../constants/theme';
import type { Quote } from '../types/quote';
import { quoteFontSize } from '../utils/quote';

/** The hero quote, animated in whenever the quote changes. */
export function QuoteView({ quote }: { quote: Quote }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
  }, [progress, quote.id]);

  const fontSize = quoteFontSize(quote.text);

  return (
    <Animated.View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${quote.text}, by ${quote.author}`}
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [14, 0],
            }),
          },
        ],
      }}
    >
      <Text style={styles.mark}>{'“'}</Text>
      <Text
        style={[
          styles.text,
          { fontSize, lineHeight: Math.round(fontSize * 1.32) },
        ]}
      >
        {quote.text}
      </Text>
      <View style={styles.authorRow}>
        <View style={styles.rule} />
        <Text style={styles.author}>{quote.author}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mark: {
    fontFamily: fonts.serif,
    fontSize: 96,
    lineHeight: 96,
    height: 64,
    color: colors.accent,
    marginLeft: -6,
  },
  text: {
    fontFamily: fonts.serif,
    color: colors.text,
    letterSpacing: 0.2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  rule: {
    width: 28,
    height: 1.5,
    backgroundColor: colors.accent,
    marginRight: spacing.md,
  },
  author: {
    flexShrink: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
});
