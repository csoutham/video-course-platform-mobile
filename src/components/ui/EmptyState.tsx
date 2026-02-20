import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../../theme/tokens';

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 10,
    backgroundColor: colors.surface.card,
    gap: spacing.xs,
  },
  title: {
    fontSize: type.subheading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  message: {
    fontSize: type.body,
    color: colors.text.secondary,
  },
});
