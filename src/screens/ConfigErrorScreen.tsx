import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../theme/tokens';

type Props = {
  message: string;
};

export function ConfigErrorScreen({ message }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Configuration Error</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.page,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    padding: spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.card,
    gap: spacing.sm,
  },
  title: {
    fontSize: type.heading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  message: {
    fontSize: type.bodyLarge,
    color: colors.text.secondary,
  },
});
