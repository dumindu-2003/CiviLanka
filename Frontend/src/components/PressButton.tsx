import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const PRESS_YELLOW = '#F5C400';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  label: string;
  onPress: () => void;
  icon?: IconName;
  iconSize?: number;
  disabled?: boolean;
  selected?: boolean;
  /** normal look of the button (background, size, radius...) */
  style?: StyleProp<ViewStyle>;
  /** normal look of the label (size, weight...) */
  textStyle?: StyleProp<TextStyle>;
  /** label + icon colour when NOT pressed */
  color?: string;
}

/**
 * A button that turns yellow (with navy text/icon) while it is pressed.
 * Use it for any button that should give the yellow click feedback.
 */
export function PressButton({
  label,
  onPress,
  icon,
  iconSize = 16,
  disabled,
  selected,
  style,
  textStyle,
  color = colors.white,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      style={({ pressed }) => [style, pressed && !disabled && styles.pressed]}
    >
      {({ pressed }) => {
        const fg = pressed && !disabled ? colors.navy : color;
        return (
          <>
            {icon ? <Ionicons name={icon} size={iconSize} color={fg} /> : null}
            <Text style={[textStyle, { color: fg }]}>{label}</Text>
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { backgroundColor: PRESS_YELLOW },
});