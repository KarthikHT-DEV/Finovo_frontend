import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    Pressable,
    Text,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ONBOARDING_SLIDES from '../constants/onboardingSlides';
import Colors from '../styles/colors';
import getOnboardingStyles, {
    CTA_SIZE,
    DOT_ACTIVE_WIDTH,
    DOT_SIZE,
    ILLUSTRATION_SIZE,
} from '../styles/OnboardingScreen.styles';
import { useTheme } from '../styles/theme';

// ─── Animation configuration ─────────────────────────────────────────────────
const SLIDE_EXIT_DURATION = 200;
const SLIDE_ENTER_DURATION = 320;
const EASING_ENTER = Easing.out(Easing.cubic);
const EASING_EXIT = Easing.in(Easing.ease);

/**
 * OnboardingScreen
 *
 * Adaptive multi-slide onboarding — each slide can specify its own
 * header variant ('logo-skip' | 'back-title') and CTA variant
 * ('arrow-button' | 'get-started').
 *
 * @param {{ onComplete: () => void }} props
 */
export default function OnboardingScreen({ onComplete }) {
    const { colors } = useTheme();
    const styles = React.useMemo(() => getOnboardingStyles(colors), [colors]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const totalSlides = ONBOARDING_SLIDES.length;

    // ── Mount entrance animated values ───────────────────────────────────────
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(-16)).current;
    const illustrationScale = useRef(new Animated.Value(0.88)).current;
    const illustrationOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(24)).current;
    const ctaScale = useRef(new Animated.Value(0.8)).current;

    // ── Slide transition animated values ─────────────────────────────────────
    const slideOpacity = useRef(new Animated.Value(1)).current;
    const slideTranslateX = useRef(new Animated.Value(0)).current;

    // ── Per-dot width animated values ─────────────────────────────────────────
    const dotWidths = useRef(
        ONBOARDING_SLIDES.map((_, i) =>
            new Animated.Value(i === 0 ? DOT_ACTIVE_WIDTH : DOT_SIZE)
        )
    ).current;

    // ── Staggered entrance on mount ───────────────────────────────────────────
    useEffect(() => {
        Animated.stagger(70, [
            Animated.parallel([
                Animated.timing(headerOpacity, {
                    toValue: 1,
                    duration: 380,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
                Animated.timing(headerTranslateY, {
                    toValue: 0,
                    duration: 380,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(illustrationScale, {
                    toValue: 1,
                    friction: 7,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(illustrationOpacity, {
                    toValue: 1,
                    duration: 450,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 380,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
                Animated.timing(contentTranslateY, {
                    toValue: 0,
                    duration: 380,
                    easing: EASING_ENTER,
                    useNativeDriver: true,
                }),
            ]),
            Animated.spring(ctaScale, {
                toValue: 1,
                friction: 5,
                tension: 60,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // ── Dot widths animate on index change ────────────────────────────────────
    const animateDots = useCallback(
        (nextIndex) => {
            Animated.parallel(
                dotWidths.map((dotWidth, i) =>
                    Animated.timing(dotWidth, {
                        toValue: i === nextIndex ? DOT_ACTIVE_WIDTH : DOT_SIZE,
                        duration: 280,
                        easing: EASING_ENTER,
                        useNativeDriver: false, // 'width' is a layout property
                    })
                )
            ).start();
        },
        [dotWidths]
    );

    // ── Slide transition: exit left → update → enter from right ──────────────
    const transitionToSlide = useCallback(
        (nextIndex) => {
            Animated.parallel([
                Animated.timing(slideOpacity, {
                    toValue: 0,
                    duration: SLIDE_EXIT_DURATION,
                    easing: EASING_EXIT,
                    useNativeDriver: true,
                }),
                Animated.timing(slideTranslateX, {
                    toValue: -36,
                    duration: SLIDE_EXIT_DURATION,
                    easing: EASING_EXIT,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setCurrentIndex(nextIndex);
                slideTranslateX.setValue(36);

                Animated.parallel([
                    Animated.timing(slideOpacity, {
                        toValue: 1,
                        duration: SLIDE_ENTER_DURATION,
                        easing: EASING_ENTER,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideTranslateX, {
                        toValue: 0,
                        duration: SLIDE_ENTER_DURATION,
                        easing: EASING_ENTER,
                        useNativeDriver: true,
                    }),
                ]).start();
            });

            animateDots(nextIndex);
        },
        [animateDots, slideOpacity, slideTranslateX]
    );

    // ── CTA handlers ──────────────────────────────────────────────────────────
    const handleNext = useCallback(() => {
        if (currentIndex < totalSlides - 1) {
            transitionToSlide(currentIndex + 1);
        } else {
            onComplete?.();
        }
    }, [currentIndex, totalSlides, onComplete, transitionToSlide]);

    const handleBack = useCallback(() => {
        if (currentIndex > 0) {
            transitionToSlide(currentIndex - 1);
        }
    }, [currentIndex, transitionToSlide]);

    // CTA spring press feedback
    const onCtaPressIn = useCallback(() => {
        Animated.spring(ctaScale, { toValue: 0.93, friction: 4, useNativeDriver: true }).start();
    }, [ctaScale]);

    const onCtaPressOut = useCallback(() => {
        Animated.spring(ctaScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }, [ctaScale]);

    // ─────────────────────────────────────────────────────────────────────────
    const slide = ONBOARDING_SLIDES[currentIndex];

    // ── Sub-renders ───────────────────────────────────────────────────────────

    const renderHeader = () => {
        if (slide.header === 'logo-skip') {
            return (
                <Animated.View
                    style={[
                        styles.headerLogoSkip,
                        { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
                    ]}
                >
                    <View style={{ width: 60 }} />
                    <Text style={styles.headerLogo}>Finovo</Text>
                    <Pressable onPress={onComplete} hitSlop={12} style={styles.headerSkip}>
                        <Text style={styles.headerSkipLabel}>Skip</Text>
                    </Pressable>
                </Animated.View>
            );
        }

        // 'back-title'
        return (
            <Animated.View
                style={[
                    styles.headerBackTitle,
                    { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
                ]}
            >
                <Pressable style={styles.headerBackButton} onPress={handleBack} hitSlop={12}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerCenteredTitle}>Finovo</Text>
            </Animated.View>
        );
    };

    const renderIllustration = () => {
        const { illustration } = slide;

        let inner;
        if (illustration.type === 'image') {
            inner = (
                <Image source={illustration.source} style={styles.illustrationPhoto} />
            );
        } else if (illustration.type === 'photo-placeholder') {
            inner = (
                <View
                    style={[
                        styles.illustrationPhotoPlaceholder,
                        { backgroundColor: illustration.tint + '33' },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="image-outline"
                        size={ILLUSTRATION_SIZE * 0.3}
                        color={illustration.tint}
                    />
                    <Text style={{ color: illustration.tint, marginTop: 8, fontSize: 12 }}>
                        Drop save_smarter.jpg in assets/images/
                    </Text>
                </View>
            );
        } else {
            inner = (
                <View style={styles.illustrationIconContainer}>
                    <MaterialCommunityIcons
                        name={illustration.name}
                        size={ILLUSTRATION_SIZE * 0.38}
                        color={colors.textPrimary}
                    />
                </View>
            );
        }

        return (
            <Animated.View
                style={[
                    styles.illustrationWrapper,
                    {
                        opacity: illustrationOpacity,
                        transform: [{ scale: illustrationScale }],
                    },
                ]}
            >
                {inner}
            </Animated.View>
        );
    };

    const renderDots = () => (
        <View style={styles.dotsRow}>
            {ONBOARDING_SLIDES.map((_, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.dot,
                        {
                            width: dotWidths[index],
                            backgroundColor:
                                index === currentIndex ? colors.accent : colors.divider,
                        },
                    ]}
                />
            ))}
        </View>
    );

    const renderCta = () => {
        if (slide.cta === 'arrow-button') {
            return (
                <View style={styles.footerArrow}>
                    <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                        <Pressable
                            style={styles.ctaArrowButton}
                            onPress={handleNext}
                            onPressIn={onCtaPressIn}
                            onPressOut={onCtaPressOut}
                        >
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={CTA_SIZE * 0.42}
                                color={colors.backgroundPrimary}
                            />
                        </Pressable>
                    </Animated.View>
                </View>
            );
        }

        // 'get-started'
        return (
            <View style={styles.footerGetStarted}>
                <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                    <Pressable
                        style={styles.ctaGetStartedButton}
                        onPress={onComplete}
                        onPressIn={onCtaPressIn}
                        onPressOut={onCtaPressOut}
                    >
                        <Text style={styles.ctaGetStartedLabel}>Get Started</Text>
                        <MaterialCommunityIcons
                            name="arrow-right"
                            size={20}
                            color={colors.backgroundPrimary}
                        />
                    </Pressable>
                </Animated.View>
            </View>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>

            {/* ── Header (variant driven by slide config) ── */}
            {renderHeader()}

            {/* ── Illustration (variant driven by slide config) ── */}
            {renderIllustration()}

            {/* ── Slide content (animated transition) ── */}
            <Animated.View
                style={[
                    styles.contentWrapper,
                    {
                        opacity: Animated.multiply(contentOpacity, slideOpacity),
                        transform: [
                            { translateY: contentTranslateY },
                            { translateX: slideTranslateX },
                        ],
                    },
                ]}
            >
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

                {/* Pagination dots — centred below subtitle on back-title variant */}
                {renderDots()}
            </Animated.View>

            {/* ── CTA (variant driven by slide config) ── */}
            <Animated.View
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    opacity: contentOpacity,
                }}
            >
                {renderCta()}
            </Animated.View>

        </View>
    );
}
