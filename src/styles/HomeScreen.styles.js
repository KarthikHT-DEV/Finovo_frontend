import { StyleSheet } from 'react-native';

import Typography from './typography';

export const getStyles = (Colors, insets) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundPrimary,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Math.max(insets?.top || 60, 20),
        paddingBottom: Math.max(insets?.bottom || 0, 100), // Make room for floating bottom nav
    },

    // Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greetingSubtitle: {
        fontSize: Typography.size.sm,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontWeight: Typography.weight.medium,
    },
    greetingTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greetingTitle: {
        fontSize: Typography.size['2xl'],
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    notificationIcon: {
        position: 'relative',
        padding: 6,
    },
    notificationDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.textDanger,
        borderWidth: 1,
        borderColor: Colors.backgroundPrimary,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    miniAvatarWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.backgroundCard,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: Colors.backgroundCard,
    },
    miniAvatarImage: {
        width: '100%',
        height: '100%',
    },
    miniAvatarInitials: {
        fontSize: 16,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
    },

    // Dark Balance Card
    balanceCard: {
        backgroundColor: Colors.backgroundCardDark,
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    balanceLabel: {
        fontSize: Typography.size.xs,
        color: Colors.textInvSecondary,
        fontWeight: Typography.weight.semibold,
        letterSpacing: 1,
    },
    menuButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceAmountRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    balanceAmountWhole: {
        fontSize: 42,
        fontWeight: Typography.weight.bold,
        color: Colors.textInvPrimary,
        lineHeight: 48,
    },
    balanceAmountDecimal: {
        fontSize: 22,
        fontWeight: Typography.weight.medium,
        color: Colors.textInvSecondary,
        marginBottom: 4,
        opacity: 0.8,
    },

    // Income/Expense Chips inside dark card
    flowRow: {
        flexDirection: 'row',
        gap: 16,
    },
    flowChip: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 16,
    },
    flowLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    flowLabel: {
        fontSize: Typography.size.xs,
        color: Colors.textInvSecondary,
        fontWeight: Typography.weight.medium,
    },
    flowAmount: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.textInvPrimary,
    },

    // Section Headers
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
    },
    seeAnalytics: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.medium,
        color: Colors.accentDark,
    },

    // Spending Box
    spendingCard: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    chartContainer: {
        position: 'relative',
        width: 90,
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartInnerContent: {
        position: 'absolute',
        alignItems: 'center',
    },
    chartLabel: {
        fontSize: 8,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        fontWeight: Typography.weight.bold,
        letterSpacing: 0.5,
    },
    chartValue: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
    },
    legendContainer: {
        flex: 1,
        marginLeft: 32,
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    legendDotLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    legendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    legendLabel: {
        fontSize: Typography.size.sm,
        color: Colors.textPrimary,
        fontWeight: Typography.weight.medium,
    },
    legendAmount: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
    },

    // Transactions
    transactionCard: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    transactionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionName: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    transactionSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: Typography.weight.regular,
    },
    transactionAmount: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
    }
});


