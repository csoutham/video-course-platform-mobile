import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { SkeletonRows } from '../components/ui/SkeletonRows';
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
  const { user, apiClient, logoutAllDevices } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReceipts = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setErrorMessage(null);
        const response = await apiClient.requestWithCache<ReceiptsResponse>('/api/v1/mobile/receipts', {
          forceRefresh,
        });
        setReceipts(response.receipts);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load receipts right now.');
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

  const onLogoutAllDevices = useCallback(() => {
    Alert.alert('Log out all devices', 'This will sign you out from every active mobile session for this account.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log out all',
        style: 'destructive',
        onPress: () => {
          setIsRevokingAll(true);
          void logoutAllDevices()
            .then(() => {
              Alert.alert('Done', 'All active sessions have been revoked.');
            })
            .catch((error) => {
              Alert.alert('Unable to revoke sessions', error instanceof Error ? error.message : 'Unknown error');
            })
            .finally(() => {
              setIsRevokingAll(false);
            });
        },
      },
    ]);
  }, [logoutAllDevices]);

  return (
    <ScreenContainer>
      <SectionHeading title={user?.name || 'Account'} subtitle={user?.email || ''} />
      <View style={styles.actions}>
        <AppButton
          title={isRevokingAll ? 'Revoking...' : 'Log out all devices'}
          onPress={onLogoutAllDevices}
          disabled={isRevokingAll}
          variant="secondary"
        />
      </View>
      <Text style={styles.sectionTitle}>Receipts</Text>

      {isLoading ? <SkeletonRows rows={3} /> : null}
      {!isLoading && errorMessage ? <ErrorState message={errorMessage} onRetry={() => loadReceipts(true)} /> : null}

      {!isLoading && !errorMessage && receipts.length === 0 ? (
        <EmptyState title="No receipts yet" message="No receipts are available for this account." />
      ) : null}

      {!isLoading && !errorMessage ? <FlatList
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
            accessibilityRole="link"
            accessibilityLabel={`Open receipt for order ${item.order_public_id}`}
            accessibilityHint="Opens Stripe receipt in your browser."
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
      /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
    minWidth: 220,
  },
  sectionTitle: {
    marginTop: spacing.xs + 2,
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
