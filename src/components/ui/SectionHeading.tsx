import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../../theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeading({ title, subtitle }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: type.body,
    color: colors.text.subtle,
  },
});
