import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../../theme/tokens';
import { AppButton } from './AppButton';

type Props = {
  title?: string;
  message: string;
  onRetry: () => void;
};

export function ErrorState({ title = 'Something went wrong', message, onRetry }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.action}>
        <AppButton title="Try again" onPress={onRetry} variant="secondary" />
      </View>
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
    gap: spacing.sm,
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
  action: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
});
