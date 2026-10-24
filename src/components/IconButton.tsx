import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, hitSlop, radii } from '../constants/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  filled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Round, translucent icon-only button used in headers. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color = colors.text,
  filled,
  size = 20,
  style,
}: IconButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, style]}
    >
      <Icon name={icon} size={size} color={color} filled={filled} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
});
