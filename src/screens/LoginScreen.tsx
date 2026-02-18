import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { useAuth } from '../context/AuthContext';

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
        <View style={styles.container}>
            <View style={[styles.card, isTablet ? styles.cardTablet : undefined]}>
                <Text style={styles.title}>Video Courses</Text>
                <Text style={styles.subtitle}>Sign in to access your purchased courses</Text>

                <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Email"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />

                <Button title={isSubmitting ? 'Signing in...' : 'Sign in'} onPress={onLogin} disabled={isSubmitting} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    card: {
        width: '100%',
        gap: 12,
    },
    cardTablet: {
        maxWidth: 480,
        padding: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#ffffff',
        shadowColor: '#0f172a',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
    },
});
