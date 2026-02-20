import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../theme/tokens';

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderColor: colors.border.default,
    borderWidth: 1,
    backgroundColor: colors.surface.card,
    overflow: 'hidden',
  },
});
