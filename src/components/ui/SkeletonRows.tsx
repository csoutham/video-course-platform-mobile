import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme/tokens';

type Props = {
  rows?: number;
  height?: number;
};

export function SkeletonRows({ rows = 3, height = 68 }: Props) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={[styles.row, { height }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    borderRadius: radius.md,
    backgroundColor: colors.surface.muted,
  },
});
