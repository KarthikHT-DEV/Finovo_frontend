import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FormInput } from '../components/FormInput';
import { useTheme } from '../styles/theme';
import { useAlert } from '../contexts/AlertContext';
import authService from '../services/authService';

export default function ResetPasswordScreen({ email, onBack, onSuccess }) {
    const { colors } = useTheme();
    const { showAlert } = useAlert();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleReset = async () => {
        const finalOtp = otp.join('');
        if (finalOtp.length < 6) {
            showAlert('Error', 'Please enter the 6-digit recovery code.');
            return;
        }
        if (!newPassword || newPassword.length < 8) {
            showAlert('Error', 'Password must be at least 8 characters (including uppercase, digit, and special character).');
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(email, finalOtp, newPassword);
            showAlert('Success', 'Password reset successful. Please log in.', {
                onConfirm: onSuccess
            });
        } catch (err) {
            showAlert('Error', err.response?.data?.error || 'Failed to reset password.');
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

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Reset Password</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Enter the code sent to {email} and your new password.
                </Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputs.current[index] = ref)}
                            style={[
                                styles.otpInput,
                                {
                                    color: colors.textPrimary,
                                    borderColor: digit ? colors.textPrimary : colors.outlinedBorder,
                                    backgroundColor: colors.backgroundCard
                                }
                            ]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(v) => handleOtpChange(v, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                        />
                    ))}
                </View>

                <FormInput
                    label="New Password"
                    placeholder="••••••••"
                    isPassword
                    value={newPassword}
                    onChangeText={setNewPassword}
                />

                <FormInput
                    label="Confirm New Password"
                    placeholder="••••••••"
                    isPassword
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                {loading ? (
                    <ActivityIndicator size="large" color={colors.textPrimary} style={{ marginTop: 20 }} />
                ) : (
                    <Pressable
                        style={[styles.button, { backgroundColor: colors.textPrimary }]}
                        onPress={handleReset}
                    >
                        <Text style={[styles.buttonText, { color: colors.backgroundPrimary }]}>Reset Password</Text>
                    </Pressable>
                )}
            </ScrollView>
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
    content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
    subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 32 },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 32,
    },
    otpInput: {
        width: 44,
        height: 52,
        borderRadius: 12,
        borderWidth: 1.5,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
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
