import { StyleSheet, Dimensions } from 'react-native';

import Typography from './typography';

const { width } = Dimensions.get('window');
const circleSize = (width - 40 - 3 * 20) / 4; // 4 columns, 20px padding sides, 20px gap

export const getStyles = (Colors, insets) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundPrimary,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Math.max(insets?.top || 60, 20),
        paddingBottom: Math.max(insets?.bottom || 0, 40),
    },

    // Header
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    headerLeft: {
        width: 60,
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
    },
    headerRight: {
        width: 60,
        alignItems: 'flex-end',
    },
    cancelText: {
        fontSize: Typography.size.base,
        color: Colors.textSecondary,
        fontWeight: Typography.weight.medium,
    },

    // Toggle buttons
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.backgroundCard,
        borderRadius: 30,
        padding: 4,
        marginBottom: 40,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleButtonActive: {
        backgroundColor: Colors.textPrimary,
    },
    toggleText: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.semibold,
        color: Colors.textSecondary,
    },
    toggleTextActive: {
        color: Colors.backgroundPrimary,
    },

    // Amount Input
    amountSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    amountLabel: {
        fontSize: Typography.size.base,
        color: Colors.textSecondary,
        marginBottom: 8,
        fontWeight: Typography.weight.medium,
    },
    amountInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 52,
        fontWeight: Typography.weight.bold,
        color: Colors.divider,
    },
    amountInput: {
        fontSize: 52,
        fontWeight: Typography.weight.bold,
        color: Colors.divider,
        minWidth: 120,
        textAlign: 'center',
    },
    amountInputActive: {
        color: Colors.textPrimary,
    },

    // Category Selector
    sectionTitleRow: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.bold,
        color: Colors.textPrimary,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 20,
        marginBottom: 32,
    },
    categoryItem: {
        width: circleSize,
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryCircle: {
        width: circleSize,
        height: circleSize,
        borderRadius: circleSize / 2,
        backgroundColor: Colors.backgroundCard,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    categoryCircleSelected: {
        backgroundColor: Colors.textPrimary,
    },
    categoryName: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: Typography.weight.medium,
        textAlign: 'center',
    },
    categoryNameSelected: {
        color: Colors.textPrimary,
        fontWeight: Typography.weight.bold,
    },

    // Payment Methods
    pmChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundCard,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
    },
    pmChipSelected: {
        backgroundColor: Colors.textPrimary,
    },
    pmText: {
        fontSize: Typography.size.sm,
        color: Colors.textPrimary,
        fontWeight: Typography.weight.semibold,
    },
    pmTextSelected: {
        color: Colors.backgroundPrimary,
    },

    // Date & Notes (shared styles for small labels)
    inputSectionLabel: {
        fontSize: 12,
        fontWeight: Typography.weight.bold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
        marginBottom: 24,
    },
    dateText: {
        fontSize: Typography.size.lg,
        color: Colors.textPrimary,
        fontWeight: Typography.weight.medium,
    },
    notesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
        marginBottom: 40,
    },
    notesInput: {
        flex: 1,
        fontSize: Typography.size.lg,
        color: Colors.textPrimary,
        marginLeft: 12,
    },

    // Save Button
    saveButton: {
        backgroundColor: Colors.textPrimary,
        borderRadius: 30,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.backgroundPrimary,
    },

    errorText: {
        color: Colors.textDanger,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: Typography.weight.medium,
    },

    // Modal Calendar
    fullModalContainer: { flex: 1, backgroundColor: Colors.backgroundPrimary },
    fullModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Math.max(insets?.top || 50, 20), paddingBottom: 20 },
    fullModalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    fullModalScroll: { paddingHorizontal: 20, paddingBottom: Math.max(insets?.bottom || 0, 40) },
    stickyFooter: {
        paddingHorizontal: 20,
        paddingBottom: Math.max(insets?.bottom || 0, 30), // Regular spacing from bottom
        backgroundColor: Colors.backgroundPrimary,
    },
    stickyFooterKeyboard: {
        paddingBottom: 0, // No extra spacing when keyboard up to be flush
    },
});


