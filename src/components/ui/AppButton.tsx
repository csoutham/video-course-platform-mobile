import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, type } from '../../theme/tokens';

type Variant = 'primary' | 'secondary';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
};

export function AppButton({ title, onPress, disabled = false, variant = 'primary' }: Props) {
  return (
    <Pressable
      style={[styles.base, variant === 'primary' ? styles.primary : styles.secondary, disabled ? styles.disabled : undefined]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, variant === 'primary' ? styles.labelPrimary : styles.labelSecondary]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  secondary: {
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontWeight: '700',
    fontSize: type.bodyLarge,
  },
  labelPrimary: {
    color: colors.text.inverse,
  },
  labelSecondary: {
    color: colors.text.primary,
  },
});
