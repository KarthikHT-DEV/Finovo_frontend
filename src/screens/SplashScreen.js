import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';
import getSplashStyles, {
    PROGRESS_TRACK_WIDTH,
    PROGRESS_FILL_RATIO,
} from '../styles/SplashScreen.styles';

/**
 * SplashScreen
 *
 * Displayed on app launch while initial resources load.
 * Orchestrates a staggered entrance animation:
 *   1. Logo card springs in
 *   2. App name slides up + fades in
 *   3. Tagline fades in
 *   4. Progress bar fills from left
 */
export default function SplashScreen({ onComplete }) {
    const { colors } = useTheme();
    const SplashScreenStyles = React.useMemo(() => getSplashStyles(colors), [colors]);

    // --- Animated values ---
    const logoScale = useRef(new Animated.Value(0.75)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(14)).current;

    const taglineOpacity = useRef(new Animated.Value(0)).current;

    const progressFillWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // === Staggered entrance sequence ===
        Animated.sequence([
            Animated.delay(150), // Settle delay
            // Phase 1: Logo springs into view (Much slower)
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 9, // Even more friction
                    tension: 25, // Lower tension
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 1000, // Increased to 1s
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),

            // Phase 2: App name slides up and fades in
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 800, // Increased
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(titleTranslateY, {
                    toValue: 0,
                    duration: 800, // Increased
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),

            // Phase 3: Tagline fades in
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 700, // Increased
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        // Progress bar fills COMPLETELY
        Animated.timing(progressFillWidth, {
            toValue: PROGRESS_TRACK_WIDTH,
            duration: 3500, // Much slower and more visible
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
        }).start(() => {
            // === Out Animation ===
            Animated.parallel([
                Animated.timing(logoOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
                Animated.timing(titleOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
                Animated.timing(taglineOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
                Animated.timing(logoScale, { toValue: 1.15, duration: 600, useNativeDriver: true }),
            ]).start(() => {
                if (onComplete) onComplete();
            });
        });
    }, [onComplete]);

    // ---------------------------------------------------------------------------

    return (
        <View style={SplashScreenStyles.container}>

            {/* ── Logo Card ── */}
            <Animated.View
                style={[
                    SplashScreenStyles.logoCard,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
            >
                <Image 
                    source={require('../../assets/app-icon.png')} 
                    style={{ width: '100%', height: '100%', borderRadius: 12 }} 
                    resizeMode="contain"
                />
            </Animated.View>

            {/* ── App Name ── */}
            <Animated.Text
                style={[
                    SplashScreenStyles.appName,
                    {
                        opacity: titleOpacity,
                        transform: [{ translateY: titleTranslateY }],
                    },
                ]}
            >
                Finovo
            </Animated.Text>

            {/* ── Tagline ── */}
            <Animated.Text
                style={[SplashScreenStyles.tagline, { opacity: taglineOpacity }]}
            >
                CONTROL YOUR MONEY. CALMLY.
            </Animated.Text>

            {/* ── Progress Bar ── */}
            <View style={SplashScreenStyles.progressSection}>
                <View
                    style={[
                        SplashScreenStyles.progressTrack,
                        { width: PROGRESS_TRACK_WIDTH },
                    ]}
                >
                    <Animated.View
                        style={[SplashScreenStyles.progressFill, { width: progressFillWidth }]}
                    />
                </View>
                <Text style={SplashScreenStyles.loadingLabel}>Loading...</Text>
            </View>

        </View>
    );
}
