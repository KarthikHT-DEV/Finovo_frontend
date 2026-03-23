import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import { useAlert } from '../contexts/AlertContext';
import authService from '../services/authService';

/**
 * OTPScreen
 * 
 * Handles 6-digit OTP entry for email verification.
 * 
 * @param {{ email: string, onVerifySuccess: () => void, onResend: () => void, onBack: () => void }} props
 */
export default function OTPScreen({ email, onVerifySuccess, onResend, onBack }) {
    const { colors } = useTheme();
    const { showAlert } = useAlert();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputs = useRef([]);

    // ── Timer Logic ──────────────────────────────────────────────────────────
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }

        // If all digits entered, auto-verify
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerify = async (code) => {
        const finalOtp = code || otp.join('');
        if (finalOtp.length < 6) return;

        setLoading(true);
        try {
            await authService.verifyOTP(email, finalOtp);
            onVerifySuccess();
        } catch (err) {
            showAlert('Verification Failed', err.response?.data?.error || 'Invalid or expired OTP.');
            // Clear OTP on error
            setOtp(['', '', '', '', '', '']);
            inputs.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setResending(true);
        try {
            await authService.sendOTP(email);
            setTimer(60);
            showAlert('Success', 'A new code has been sent to your email.');
        } catch (err) {
            showAlert('Error', 'Failed to resend code. Please try again.');
        } finally {
            setResending(false);
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
                <Text style={[styles.title, { color: colors.textPrimary }]}>Verify Email</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    We've sent a 6-digit code to{'\n'}
                    <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{email}</Text>
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

                {loading ? (
                    <ActivityIndicator size="large" color={colors.textPrimary} style={{ marginTop: 40 }} />
                ) : (
                    <Pressable
                        style={[styles.verifyButton, { backgroundColor: colors.textPrimary }]}
                        onPress={() => handleVerify()}
                    >
                        <Text style={[styles.verifyButtonText, { color: colors.backgroundPrimary }]}>Verify Code</Text>
                    </Pressable>
                )}

                <View style={styles.resendContainer}>
                    <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                        Didn't receive code?{' '}
                    </Text>
                    <Pressable onPress={handleResend} disabled={timer > 0 || resending}>
                        <Text style={[
                            styles.resendLink,
                            { color: timer > 0 ? colors.textMuted : colors.textPrimary }
                        ]}>
                            {resending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    otpInput: {
        width: 48,
        height: 56,
        borderRadius: 12,
        borderWidth: 1.5,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
    },
    verifyButton: {
        width: '100%',
        height: 58,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        elevation: 2,
    },
    verifyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendContainer: {
        flexDirection: 'row',
        marginTop: 32,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 15,
    },
    resendLink: {
        fontSize: 15,
        fontWeight: 'bold',
    },
});
