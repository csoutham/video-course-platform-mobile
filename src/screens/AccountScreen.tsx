import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { buildApiUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
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
    <View style={styles.container}>
      <Text style={styles.title}>{user?.name}</Text>
      <Text style={styles.meta}>{user?.email}</Text>

      <Pressable
        style={styles.catalogButton}
        onPress={() => {
          Linking.openURL(buildApiUrl('/courses'));
        }}
      >
        <Text style={styles.catalogButtonText}>Find more Courses</Text>
      </Pressable>

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
            style={styles.receiptCard}
            onPress={() => {
              Linking.openURL(item.receipt_url);
            }}
          >
            <Text style={styles.receiptTitle}>Order {item.order_public_id}</Text>
            <Text style={styles.meta}>
              {formatAmount(item.total_amount, item.currency)} · {item.status}
            </Text>
            <Text style={styles.meta}>Paid: {formatDate(item.paid_at)}</Text>
            {item.refunded_at ? <Text style={styles.meta}>Refunded: {formatDate(item.refunded_at)}</Text> : null}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  meta: {
    color: '#475569',
  },
  catalogButton: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  catalogButtonText: {
    fontWeight: '600',
    color: '#1d4ed8',
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  receiptCard: {
    borderRadius: 10,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 12,
    gap: 4,
  },
  receiptTitle: {
    color: '#0f172a',
    fontWeight: '700',
  },
});
