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
    Image,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FormInput } from '../components/FormInput';
import { useTheme } from '../styles/theme';
import { useAlert } from '../contexts/AlertContext';
import authService from '../services/authService';
import getRegisterStyles from '../styles/RegisterScreen.styles';

// --- Animation config ---
const EASING_ENTER = Easing.out(Easing.cubic);

export default function RegisterScreen({ onBack, onSignInPress, onRegisterSuccess }) {
    const { colors } = useTheme();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();
    const styles = React.useMemo(() => getRegisterStyles(colors, insets), [colors, insets]);

    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Entrance animated values ---
    const headerAnim = useRef(new Animated.Value(0)).current;
    const heroAnim = useRef(new Animated.Value(0)).current;
    const heroSlideY = useRef(new Animated.Value(16)).current;
    const formAnim = useRef(new Animated.Value(0)).current;
    const formSlideY = useRef(new Animated.Value(20)).current;
    const buttonScale = useRef(new Animated.Value(0.92)).current;
    const buttonAnim = useRef(new Animated.Value(0)).current;
    const bottomAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(55, [
            Animated.timing(headerAnim, {
                toValue: 1,
                duration: 340,
                easing: EASING_ENTER,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(heroAnim, {
                    toValue: 1,
                    duration: 370,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
                Animated.timing(heroSlideY, {
                    toValue: 0,
                    duration: 370,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
            ]),
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
            Animated.timing(bottomAnim, {
                toValue: 1,
                duration: 280,
                easing: EASING_ENTER,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const onPressIn = useCallback(() => {
        Animated.spring(buttonScale, { toValue: 0.96, friction: 4, useNativeDriver: true }).start();
    }, [buttonScale]);

    const onPressOut = useCallback(() => {
        Animated.spring(buttonScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }, [buttonScale]);

    const handleCreateAccount = useCallback(async () => {
        if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            showAlert('Registration Error', 'Please fill in all required fields.');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Registration Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const data = await authService.register(
                fullName.trim(),
                username.trim(),
                email.trim(),
                mobileNumber.trim(),
                password,
                confirmPassword,
            );
            onRegisterSuccess?.(data);
        } catch (err) {
            const serverError = err.response?.data;
            const message =
                serverError?.email?.[0] ||
                serverError?.username?.[0] ||
                serverError?.full_name?.[0] ||
                serverError?.password?.[0] ||
                serverError?.confirm_password?.[0] ||
                (typeof serverError?.non_field_errors === 'string' ? serverError?.non_field_errors : serverError?.non_field_errors?.[0]) ||
                serverError?.error ||
                serverError?.detail ||
                err.message ||
                'Something went wrong. Please try again.';
            showAlert('Registration Error', message);
        } finally {
            setLoading(false);
        }
    }, [fullName, username, email, mobileNumber, password, confirmPassword, onRegisterSuccess, showAlert]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerAnim,
                        transform: [
                            {
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0],
                                }),
                            },
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
                <Animated.View
                    style={{
                        opacity: heroAnim,
                        transform: [{ translateY: heroSlideY }],
                    }}
                >
                    <Text style={styles.heroTitle}>Create your account</Text>
                    <Text style={styles.heroSubtitle}>
                        Start your minimalist financial journey.
                    </Text>
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: formAnim,
                        transform: [{ translateY: formSlideY }],
                    }}
                >
                    <FormInput
                        label="Full Name"
                        placeholder="Enter your full name"
                        autoCapitalize="words"
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    <FormInput
                        label="Username"
                        placeholder="Choose a username"
                        autoCapitalize="none"
                        value={username}
                        onChangeText={setUsername}
                    />

                    <FormInput
                        label="Email Address"
                        placeholder="name@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <FormInput
                        label="Mobile Number"
                        placeholder="Optional"
                        keyboardType="phone-pad"
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                    />

                    <FormInput
                        label="Password"
                        placeholder="Create a password"
                        isPassword
                        value={password}
                        onChangeText={setPassword}
                    />

                    <FormInput
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        isPassword
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: buttonAnim,
                        transform: [{ scale: buttonScale }],
                    }}
                >
                    <Pressable
                        style={[styles.createButton, loading && styles.createButtonDisabled]}
                        onPress={handleCreateAccount}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        disabled={loading}
                    >
                        <Text style={styles.createButtonLabel}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Text>
                    </Pressable>
                </Animated.View>

                <Animated.View style={[styles.bottomRow, { opacity: bottomAnim }]}>
                    <Text style={styles.bottomText}>Already have an account? </Text>
                    <Pressable onPress={onSignInPress} hitSlop={8}>
                        <Text style={styles.signInLink}>Sign In</Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
