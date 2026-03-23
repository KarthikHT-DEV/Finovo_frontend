import { StyleSheet, Dimensions } from 'react-native';
import Colors from './colors';
import Typography from './typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getLoginStyles = (colors, insets) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },

    // ── Header (back-title variant) ──────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Math.max(insets?.top || 56, 16),
        paddingBottom: 8,
        position: 'relative',
    },
    headerBackButton: {
        padding: 4,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
        letterSpacing: Typography.tracking.tight,
        marginLeft: 12, // Parallel to the back arrow
    },

    // ── Scroll content ────────────────────────────────────────────────────────
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: Math.max(40, (insets?.bottom || 0) + 20),
        flexGrow: 1,
    },

    // ── Welcome copy ──────────────────────────────────────────────────────────
    welcomeTitle: {
        fontSize: Typography.size['3xl'],
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
        textAlign: 'center',
        letterSpacing: Typography.tracking.tight,
        marginBottom: 10,
    },
    welcomeSubtitle: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.regular,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 36,
    },

    // ── Sign In button ────────────────────────────────────────────────────────
    signInButton: {
        backgroundColor: colors.textPrimary,
        borderRadius: 16,
        height: 58,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    signInButtonDisabled: {
        opacity: 0.6,
    },
    signInLabel: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.semibold,
        color: colors.backgroundPrimary,
        letterSpacing: 0.2,
    },

    // ── "Or continue with" divider ────────────────────────────────────────────
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 28,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.divider,
    },
    dividerText: {
        fontSize: Typography.size.base,
        color: colors.textMuted,
        fontWeight: Typography.weight.regular,
    },

    // ── Social login buttons ──────────────────────────────────────────────────
    socialRow: {
        flexDirection: 'row',
        gap: 14,
    },
    socialButton: {
        flex: 1,
        height: 56,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.outlinedBorder,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    socialLabel: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
    },

    // ── Error message ─────────────────────────────────────────────────────────
    errorText: {
        fontSize: Typography.size.base,
        color: '#D94F4F',
        textAlign: 'center',
        marginTop: 12,
    },

    // ── Bottom sign up link ───────────────────────────────────────────────────
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: 24,
    },
    bottomText: {
        fontSize: Typography.size.base,
        color: colors.textSecondary,
    },
    signUpLink: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
        color: colors.textPrimary,
        textDecorationLine: 'underline',
    },
});

export default getLoginStyles;
