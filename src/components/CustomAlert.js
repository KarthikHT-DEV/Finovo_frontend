import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../styles/theme';

/**
 * CustomAlert
 * 
 * A standardized alert component to replace native Alert.alert
 * matches the "clear notifications" design.
 * 
 * @param {object} props
 * @param {boolean} props.visible - Modal visibility
 * @param {string} props.title - Alert title
 * @param {string} props.message - Alert message
 * @param {string} [props.confirmText] - Label for confirm button (default: OK)
 * @param {string} [props.cancelText] - Label for cancel button (default: CANCEL)
 * @param {Function} props.onConfirm - Confirm callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {boolean} [props.destructive] - If true, confirm button uses danger color
 * @param {boolean} [props.showCancel] - If true, shows cancel button (default: false)
 */
export default function CustomAlert({ 
    visible, 
    title, 
    message, 
    confirmText = 'OK', 
    cancelText = 'CANCEL', 
    onConfirm, 
    onCancel,
    destructive = false,
    showCancel = false
}) {
    const { colors } = useTheme();
    const styles = getStyles(colors, destructive);

    return (
        <Modal 
            visible={visible} 
            transparent 
            animationType="fade" 
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.actions}>
                        {showCancel && (
                            <Pressable onPress={onCancel} style={styles.cancelBtn} hitSlop={10}>
                                <Text style={styles.cancelLabel}>{cancelText}</Text>
                            </Pressable>
                        )}
                        <Pressable onPress={onConfirm} style={styles.confirmBtn} hitSlop={10}>
                            <Text style={styles.confirmLabel}>{confirmText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors, destructive) => StyleSheet.create({
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    card: { 
        backgroundColor: colors.backgroundCard, 
        borderRadius: 12, 
        width: '80%', 
        padding: 24, 
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4 
    },
    title: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: colors.textPrimary, 
        marginBottom: 12 
    },
    message: { 
        fontSize: 14, 
        color: colors.textSecondary, 
        marginBottom: 24, 
        lineHeight: 20 
    },
    actions: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        gap: 16 
    },
    cancelBtn: { padding: 8 },
    confirmBtn: { padding: 8 },
    cancelLabel: { 
        color: colors.textSecondary, 
        fontWeight: 'bold', 
        fontSize: 14, 
        letterSpacing: 0.5 
    },
    confirmLabel: { 
        color: destructive ? colors.textDanger : colors.accent, 
        fontWeight: 'bold', 
        fontSize: 14, 
        letterSpacing: 0.5 
    },
});
