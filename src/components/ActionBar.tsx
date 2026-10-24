import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '../constants/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

export interface ActionItem {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
}

/** Floating "glass" toolbar with labelled icon actions. */
export function ActionBar({ actions }: { actions: ActionItem[] }) {
  return (
    <View style={styles.bar}>
      {actions.map(action => {
        const tint = action.active ? colors.accent : colors.text;
        return (
          <PressableScale
            key={action.key}
            onPress={action.onPress}
            disabled={action.disabled}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityState={{
              disabled: action.disabled,
              selected: action.active,
            }}
            style={[styles.item, action.disabled && styles.disabled]}
          >
            <View>
              <Icon name={action.icon} color={tint} filled={action.active} />
              {action.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {action.badge > 99 ? '99+' : action.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, { color: tint }]}>{action.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  item: {
    alignItems: 'center',
    minWidth: 64,
    paddingVertical: spacing.xs,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    letterSpacing: 0.6,
    fontFamily: fonts.sansMedium,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
  },
});
