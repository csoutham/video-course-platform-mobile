import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, type } from '../theme/tokens';
import type { Receipt, ReceiptsResponse } from '../types/api';

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function AccountScreen() {
  const { user, apiClient } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadReceipts = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await apiClient.requestWithCache<ReceiptsResponse>('/api/v1/mobile/receipts', {
          forceRefresh,
        });
        setReceipts(response.receipts);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiClient],
  );

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [loadReceipts]),
  );

  return (
    <ScreenContainer>
      <SectionHeading title={user?.name || 'Account'} subtitle={user?.email || ''} />
      <Text style={styles.sectionTitle}>Receipts</Text>

      {isLoading ? <Text style={styles.meta}>Loading receipts...</Text> : null}

      {!isLoading && receipts.length === 0 ? (
        <Text style={styles.meta}>No receipts available for this account.</Text>
      ) : null}

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.order_public_id}
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={() => loadReceipts(true)}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              Linking.openURL(item.receipt_url);
            }}
          >
            <Card>
              <View style={styles.receiptCardBody}>
                <Text style={styles.receiptTitle}>Order {item.order_public_id}</Text>
                <Text style={styles.meta}>
                  {formatAmount(item.total_amount, item.currency)} · {item.status}
                </Text>
                <Text style={styles.meta}>Paid: {formatDate(item.paid_at)}</Text>
                {item.refunded_at ? <Text style={styles.meta}>Refunded: {formatDate(item.refunded_at)}</Text> : null}
              </View>
            </Card>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: spacing.xs,
    fontSize: type.heading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  meta: {
    color: colors.text.secondary,
    fontSize: type.body,
  },
  list: {
    gap: spacing.sm + 2,
    paddingBottom: spacing.xl,
  },
  receiptCardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  receiptTitle: {
    color: colors.text.primary,
    fontWeight: '700',
  },
});
