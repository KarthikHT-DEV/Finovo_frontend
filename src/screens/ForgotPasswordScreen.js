import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FormInput } from '../components/FormInput';
import { useTheme } from '../styles/theme';
import { useAlert } from '../contexts/AlertContext';
import authService from '../services/authService';

export default function ForgotPasswordScreen({ onBack, onSuccess }) {
    const { colors } = useTheme();
    const { showAlert } = useAlert();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!email.trim()) {
            showAlert('Error', 'Please enter your email.');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email.trim());
            onSuccess(email.trim());
        } catch (err) {
            showAlert('Error', err.response?.data?.error || 'Failed to send recovery code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <View style={{ width: 40, alignItems: 'flex-start' }}>
                    <Pressable onPress={onBack} hitSlop={12}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color={colors.textPrimary} />
                    </Pressable>
                </View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Finovo</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot Password</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Enter your email address and we'll send you a recovery code.
                </Text>

                <FormInput
                    label="Email Address"
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                {loading ? (
                    <ActivityIndicator size="large" color={colors.textPrimary} style={{ marginTop: 20 }} />
                ) : (
                    <Pressable
                        style={[styles.button, { backgroundColor: colors.textPrimary }]}
                        onPress={handleSendOTP}
                    >
                        <Text style={[styles.buttonText, { color: colors.backgroundPrimary }]}>Send Recovery Code</Text>
                    </Pressable>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        paddingTop: 56, 
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 8,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
    subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 32 },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    buttonText: { fontSize: 16, fontWeight: 'bold' },
});
