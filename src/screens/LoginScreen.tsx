import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, type } from '../theme/tokens';

export function LoginScreen() {
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isTablet = width >= 768;

  const onLogin = async () => {
    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={[styles.cardWrap, isTablet ? styles.cardWrapTablet : undefined]}>
          <Card>
            <View style={styles.card}>
              <Text style={styles.title}>Video Courses</Text>
              <Text style={styles.subtitle}>Sign in to access your purchased courses</Text>

              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                placeholder="Email"
                placeholderTextColor={colors.text.subtle}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                accessibilityLabel="Email address"
              />

              <TextInput
                placeholder="Password"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                placeholderTextColor={colors.text.subtle}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                accessibilityLabel="Password"
              />

              <AppButton title={isSubmitting ? 'Signing in...' : 'Sign in'} onPress={onLogin} disabled={isSubmitting} />
            </View>
          </Card>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrap: {
    width: '100%',
  },
  cardWrapTablet: {
    maxWidth: 480,
  },
  card: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: type.display,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: type.bodyLarge,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface.input,
    color: colors.text.primary,
  },
});
