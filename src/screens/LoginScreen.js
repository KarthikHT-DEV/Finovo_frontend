import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FormInput } from '../components/FormInput';
import { useTheme } from '../styles/theme';
import { useAlert } from '../contexts/AlertContext';
import authService from '../services/authService';
import getLoginStyles from '../styles/LoginScreen.styles';

// ─── Animation config ─────────────────────────────────────────────────────────
const EASING_ENTER = Easing.out(Easing.cubic);

/**
 * LoginScreen
 *
 * Handles email + password authentication.
 * On success, calls onLoginSuccess(tokens) to pass tokens up to the app router.
 *
 * @param {{ onBack: () => void, onLoginSuccess: (data: object) => void, onSignUpPress: () => void }} props
 */
export default function LoginScreen({ onBack, onLoginSuccess, onSignUpPress, onForgotPassword }) {
    const { colors } = useTheme();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();
    const styles = React.useMemo(() => getLoginStyles(colors, insets), [colors, insets]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Entrance animated values ─────────────────────────────────────────────
    const headerAnim = useRef(new Animated.Value(0)).current;
    const titleAnim = useRef(new Animated.Value(0)).current;
    const titleSlideY = useRef(new Animated.Value(18)).current;
    const formAnim = useRef(new Animated.Value(0)).current;
    const formSlideY = useRef(new Animated.Value(24)).current;
    const buttonAnim = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(0.92)).current;
    const bottomAnim = useRef(new Animated.Value(0)).current;

    // ── Staggered entrance on mount ───────────────────────────────────────────
    useEffect(() => {
        Animated.stagger(60, [
            // Header
            Animated.timing(headerAnim, {
                toValue: 1,
                duration: 350,
                easing: EASING_ENTER,
                useNativeDriver: true,
            }),
            // Welcome copy
            Animated.parallel([
                Animated.timing(titleAnim, {
                    toValue: 1,
                    duration: 380,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
                Animated.timing(titleSlideY, {
                    toValue: 0,
                    duration: 380,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
            ]),
            // Form fields
            Animated.parallel([
                Animated.timing(formAnim, {
                    toValue: 1,
                    duration: 400,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
                Animated.timing(formSlideY, {
                    toValue: 0,
                    duration: 400,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
            ]),
            // Sign In button
            Animated.parallel([
                Animated.timing(buttonAnim, {
                    toValue: 1,
                    duration: 340,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]),
            // Bottom link
            Animated.timing(bottomAnim, {
                toValue: 1,
                duration: 300,
                easing: EASING_ENTER,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // ── Sign In press feedback ───────────────────────────────────────────────
    const onSignInPressIn = useCallback(() => {
        Animated.spring(buttonScale, {
            toValue: 0.96,
            friction: 4,
            useNativeDriver: true,
        }).start();
    }, [buttonScale]);

    const onSignInPressOut = useCallback(() => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start();
    }, [buttonScale]);

    // ── Submit handler ────────────────────────────────────────────────────────
    const handleSignIn = useCallback(async () => {
        if (!email.trim() || !password.trim()) {
            showAlert('Login Error', 'Please enter your email and password.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const data = await authService.login(email.trim(), password);
            onLoginSuccess?.(data);
        } catch (err) {
            const serverError = err.response?.data;
            const message =
                serverError?.error ||
                serverError?.detail ||
                err.message ||
                'Something went wrong. Please try again.';
            showAlert('Login Error', message);
        } finally {
            setLoading(false);
        }
    }, [email, password, onLoginSuccess]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* ── Header ── */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerAnim,
                        transform: [
                            { translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
                        ],
                    },
                ]}
            >
                <View style={{ width: 40, alignItems: 'flex-start' }}>
                    <Pressable onPress={onBack} hitSlop={12}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color={colors.textPrimary} />
                    </Pressable>
                </View>
                <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center', fontSize: 22 }]}>Finovo</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Welcome copy ── */}
                <Animated.View
                    style={{
                        opacity: titleAnim,
                        transform: [{ translateY: titleSlideY }],
                    }}
                >
                    <Text style={styles.welcomeTitle}>Welcome Back</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Enter your details to continue to Finovo.
                    </Text>
                </Animated.View>

                {/* ── Form fields ── */}
                <Animated.View
                    style={{
                        opacity: formAnim,
                        transform: [{ translateY: formSlideY }],
                    }}
                >
                    <FormInput
                        label="Email Address"
                        placeholder="name@example.com"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <FormInput
                        label="Password"
                        placeholder="••••••••"
                        isPassword
                        rightLabel="Forgot?"
                        onRightLabelPress={onForgotPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                </Animated.View>

                {/* Error message (fallback for inline if needed, but we use showAlert) */}
                {/* {error ? <Text style={styles.errorText}>{error}</Text> : null} */}

                {/* ── Sign In button ── */}
                <Animated.View
                    style={{
                        opacity: buttonAnim,
                        transform: [{ scale: buttonScale }],
                    }}
                >
                    <Pressable
                        style={[styles.signInButton, loading && styles.signInButtonDisabled]}
                        onPress={handleSignIn}
                        onPressIn={onSignInPressIn}
                        onPressOut={onSignInPressOut}
                        disabled={loading}
                    >
                        <Text style={styles.signInLabel}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </Text>
                    </Pressable>
                </Animated.View>

                {/* ── Bottom — Sign Up link ── */}
                <Animated.View style={[styles.bottomRow, { opacity: bottomAnim }]}>
                    <Text style={styles.bottomText}>Don't have an account? </Text>
                    <Pressable onPress={onSignUpPress} hitSlop={8}>
                        <Text style={styles.signUpLink}>Sign Up</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
