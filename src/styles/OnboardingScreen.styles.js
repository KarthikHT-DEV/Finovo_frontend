import { StyleSheet, Dimensions } from 'react-native';
import Colors from './colors';
import Typography from './typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Exported constants used by animation logic in the screen
export const ILLUSTRATION_SIZE = SCREEN_WIDTH * 0.86;
export const DOT_ACTIVE_WIDTH = 28;
export const DOT_SIZE = 8;
export const CTA_SIZE = 58;

const getOnboardingStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },

    headerLogoSkip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 8,
    },
    headerLogo: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
        letterSpacing: Typography.tracking.tight,
        flex: 1,
        textAlign: 'center',
    },
    headerSkipLabel: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.medium,
        color: colors.textSecondary,
        letterSpacing: Typography.tracking.wide,
        textTransform: 'uppercase',
    },
    headerSkip: {
        width: 60,
        alignItems: 'flex-end',
    },

    // ── Header: variant B — "back-title" (slide 2+) ──────────────────────────
    headerBackTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 8,
        position: 'relative',
    },
    headerBackButton: {
        padding: 4,
        zIndex: 1,
    },
    headerCenteredTitle: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
        letterSpacing: Typography.tracking.tight,
        flex: 1,
        textAlign: 'center',
        marginRight: 28, // Offset the back button width to keep text truly centered in row
    },

    // ── Illustration: icon variant (slide 1, 3) ──────────────────────────────
    illustrationWrapper: {
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    illustrationIconContainer: {
        width: ILLUSTRATION_SIZE,
        height: ILLUSTRATION_SIZE * 0.95,
        borderRadius: 24,
        backgroundColor: colors.backgroundCard,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Illustration: photo variant (slide 2) ────────────────────────────────
    illustrationPhoto: {
        width: ILLUSTRATION_SIZE,
        height: ILLUSTRATION_SIZE * 0.95,
        borderRadius: 24,
        resizeMode: 'cover',
        backgroundColor: colors.backgroundCard,
    },
    illustrationPhotoPlaceholder: {
        width: ILLUSTRATION_SIZE,
        height: ILLUSTRATION_SIZE * 0.95,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Slide content ─────────────────────────────────────────────────────────
    contentWrapper: {
        paddingHorizontal: 28,
        paddingTop: 32,
        alignItems: 'center',
    },
    slideTitle: {
        fontSize: Typography.size['3xl'],
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
        textAlign: 'center',
        letterSpacing: Typography.tracking.tight,
        marginBottom: 14,
    },
    slideSubtitle: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },

    // ── Dots (used in both layouts) ──────────────────────────────────────────
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 28,
        justifyContent: 'center',
    },
    dot: {
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
    },

    // ── Footer: variant A — arrow button (slide 1) ───────────────────────────
    footerArrow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingBottom: 40,
        paddingTop: 16,
        flex: 1,
    },
    ctaArrowButton: {
        width: CTA_SIZE,
        height: CTA_SIZE,
        borderRadius: CTA_SIZE / 2,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },

    // ── Footer: variant B — get started button (slide 2+) ───────────────────
    footerGetStarted: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
    },
    ctaGetStartedButton: {
        backgroundColor: colors.textPrimary,
        borderRadius: 16,
        height: 58,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    ctaGetStartedLabel: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: colors.backgroundPrimary,
        letterSpacing: Typography.tracking.normal,
    },
});

export default getOnboardingStyles;
