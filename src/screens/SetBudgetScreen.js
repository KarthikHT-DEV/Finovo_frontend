import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, ScrollView, Pressable, TextInput,
    ActivityIndicator, Animated, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import transactionService from '../services/transactionService';
import userService from '../services/userService';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../styles/theme';

export default function SetBudgetScreen({ onBack, onNavigate }) {
    const { colors, currency, formatCurrency } = useTheme();
    const BG = colors.backgroundPrimary;
    const CARD = colors.backgroundCard;
    const DARK = colors.textPrimary;
    const MUTED = colors.textSecondary;
    const BORDER = colors.divider;
    const ACCENT = colors.accent;
    const RED = colors.textDanger;
    const insets = useSafeAreaInsets();
    const s = React.useMemo(() => getStyles(colors, BG, CARD, DARK, MUTED, BORDER, ACCENT, RED, insets), [colors, insets]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await transactionService.getBudgets();

            const mapped = data.map(item => ({
                ...item,
                enabled: item.amount !== null && item.amount > 0,
                amountInput: item.amount !== null && item.amount > 0 ? String(item.amount) : '',
            }));
            setCategories(mapped);

            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        } catch (e) {
            console.warn('Failed to load budgets', e);
        } finally {
            setLoading(false);
        }
    }, [fadeAnim]);

    useEffect(() => { loadData(); }, [loadData]);

    // Calculate total budget on the fly
    const totalBudget = categories.reduce((sum, cat) => {
        if (cat.enabled && cat.amountInput) {
            const val = parseFloat(cat.amountInput);
            if (!isNaN(val)) return sum + val;
        }
        return sum;
    }, 0);

    // Use global formatCurrency

    const handleToggle = (id, currentVal) => {
        setCategories(prev => prev.map(c =>
            c.category_id === id ? { ...c, enabled: !currentVal } : c
        ));
    };

    const handleAmountChange = (id, text) => {
        const cleaned = text.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) return;
        if (parts[1] && parts[1].length > 2) return;

        setCategories(prev => prev.map(c =>
            c.category_id === id ? { ...c, amountInput: cleaned } : c
        ));
    };

    const handleResetAll = () => {
        setCategories(prev => prev.map(c => ({ ...c, enabled: false, amountInput: '' })));
    };

    const handleSave = async () => {
        const payload = categories
            .filter(c => c.enabled && c.amountInput && parseFloat(c.amountInput) > 0)
            .map(c => ({
                category_id: c.category_id,
                amount: parseFloat(c.amountInput),
            }));

        try {
            setSaving(true);
            // Save budgets to categories
            await transactionService.updateBudgets(payload);

            // Also update the total savings goal in the profile to match this total
            // This ensures the goal card tracks the new sum.
            await userService.updateProfile({ monthly_savings_goal: totalBudget });

            Alert.alert('Success', 'Monthly budget updated successfully.', [
                { text: 'OK', onPress: () => onBack() }
            ]);
        } catch (e) {
            console.warn('Save failed', e);
            Alert.alert('Error', 'Failed to save budgets. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={DARK} />
            </View>
        );
    }

    return (
        <View style={s.container}>
            {/* ── Fixed Top Bar ── */}
            <View style={s.topBar}>
                <Pressable onPress={onBack} hitSlop={12}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={DARK} />
                </Pressable>
                <Text style={s.topBarTitle}>Set Monthly Budget</Text>
                <View style={{ width: 26 }} />
            </View>

            <Animated.View style={[s.headerBlock, { opacity: fadeAnim }]}>
                <Text style={s.totalLabel}>Total Monthly Limit</Text>
                <View style={s.totalAmountRow}>
                    <Text style={s.totalAmount}>{formatCurrency(totalBudget)}</Text>
                </View>
                <View style={s.totalUnderline} />
            </Animated.View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={0}
            >
                <Animated.ScrollView
                    contentContainerStyle={[
                        s.scroll,
                        { paddingBottom: 80 } // Always add extra padding in budget screen since it's a long list
                    ]}
                    showsVerticalScrollIndicator={false}
                    style={{ opacity: fadeAnim }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Categories Header */}
                    <View style={s.catHeaderRow}>
                        <Text style={s.catHeaderTitle}>Categories</Text>
                        <Pressable onPress={handleResetAll} hitSlop={10}>
                            <Text style={s.resetText}>RESET ALL</Text>
                        </Pressable>
                    </View>

                    {/* Category List */}
                    {categories.map((cat) => (
                        <View key={cat.category_id} style={s.catCard}>
                            <View style={[s.catIconBg, { backgroundColor: cat.color + '33' }]}>
                                <MaterialCommunityIcons
                                    name={cat.icon_name}
                                    size={24}
                                    color={DARK}
                                />
                            </View>

                            <View style={s.catInfo}>
                                <Text style={s.catName}>{cat.name}</Text>
                                {/* Remaining balance row */}
                                {cat.enabled && parseFloat(cat.amountInput || 0) > 0 ? (() => {
                                    const inputAmount = parseFloat(cat.amountInput || 0);
                                    const spent = cat.spent || 0;
                                    const remaining = inputAmount - spent;
                                    const pct = Math.min(spent / inputAmount, 1);
                                    const isOver = remaining < 0;
                                    return (
                                        <>
                                            <Text style={[s.catRemaining, isOver && { color: RED }]}>
                                                Budget left: {isOver ? '-' : ''}{formatCurrency(Math.abs(remaining))}
                                            </Text>
                                            <View style={s.progressTrack}>
                                                <View style={[
                                                    s.progressFill,
                                                    { width: `${pct * 100}%`, backgroundColor: isOver ? RED : ACCENT }
                                                ]} />
                                            </View>
                                        </>
                                    );
                                })() : (
                                    <Text style={s.catDesc}>
                                        {cat.name === 'Housing' ? 'Rent, utilities, taxes' :
                                            cat.name === 'Food' ? 'Groceries, dining out' :
                                                cat.name === 'Transport' ? 'Commute, fuel, repairs' :
                                                    cat.name === 'Fun' || cat.name === 'Entertainment' ? 'Hobbies, movies, subs' :
                                                        'Monthly expenses'}
                                    </Text>
                                )}
                            </View>

                            <View style={s.catRight}>
                                {cat.enabled && (
                                    <View style={s.inputWrapper}>
                                        <TextInput
                                            style={s.amountInput}
                                            value={cat.amountInput}
                                            onChangeText={(t) => handleAmountChange(cat.category_id, t)}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={MUTED}
                                            maxLength={7}
                                        />
                                    </View>
                                )}
                                <Switch
                                    value={cat.enabled}
                                    onValueChange={() => handleToggle(cat.category_id, cat.enabled)}
                                    trackColor={{ false: '#DDD8CF', true: DARK }}
                                    thumbColor="#FFF"
                                />
                            </View>
                        </View>
                    ))}

                </Animated.ScrollView>

                {/* Sticky Save Button below scroll, above BottomNav */}
                <Animated.View style={[s.saveBtnWrapper, { opacity: fadeAnim }]}>
                    <Pressable
                        style={[s.saveBtn, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={s.saveBtnText}>Save</Text>
                        )}
                    </Pressable>
                </Animated.View>
            </KeyboardAvoidingView>

            <BottomNav activeTab="profile" onTabChange={onNavigate} />
        </View>
    );
}
const getStyles = (colors, BG, CARD, DARK, MUTED, BORDER, ACCENT, RED, insets) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },

    // Top bar
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 44,
        paddingHorizontal: 20, paddingBottom: 16,
        backgroundColor: BG,
    },
    topBarTitle: { fontSize: 18, fontWeight: '700', color: DARK },

    // Header Block
    headerBlock: {
        alignItems: 'center', backgroundColor: BG,
        paddingTop: 16, paddingBottom: 24,
        borderBottomWidth: 1, borderBottomColor: BORDER,
        marginBottom: 20,
    },
    totalLabel: { fontSize: 13, fontWeight: '600', color: '#607D8B', marginBottom: 8 },
    totalAmountRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
    totalSymbol: { fontSize: 28, fontWeight: '600', color: '#889BA5', marginTop: 6, marginRight: 6 },
    totalAmount: { fontSize: 42, fontWeight: '800', color: DARK },
    totalUnderline: { width: 50, height: 4, backgroundColor: DARK, borderRadius: 2, marginTop: 8 },

    // Scroll
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },

    // Cat Header
    catHeaderRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
    },
    catHeaderTitle: { fontSize: 18, fontWeight: '800', color: DARK },
    resetText: { fontSize: 11, fontWeight: '700', color: '#607D8B', letterSpacing: 0.8 },

    // Cat Card
    catCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: CARD, borderRadius: 24,
        padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    catIconBg: {
        width: 46, height: 46, borderRadius: 23,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
    },
    catInfo: { flex: 1, justifyContent: 'center', marginRight: 8 },
    catName: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 2 },
    catDesc: { fontSize: 12, color: '#889BA5' },
    catRemaining: { fontSize: 12, fontWeight: '600', color: ACCENT, marginBottom: 4 },
    progressTrack: {
        height: 4, borderRadius: 2, backgroundColor: colors.progressTrack, overflow: 'hidden',
    },
    progressFill: {
        height: 4, borderRadius: 2,
    },
    catRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    inputWrapper: {
        backgroundColor: BG, borderRadius: 8,
        borderWidth: 1, borderColor: BORDER,
        paddingHorizontal: 8, paddingVertical: 6,
        minWidth: 70, alignItems: 'flex-end',
    },
    amountInput: {
        fontSize: 16, fontWeight: '700', color: DARK,
        textAlign: 'right', minWidth: 40,
    },

    saveBtnWrapper: {
        paddingHorizontal: 20, 
        paddingBottom: Math.max(8, insets.bottom) + 84, // Account for fixed BottomNav height
        paddingTop: 8,
        backgroundColor: BG,
    },
    saveBtn: {
        backgroundColor: DARK, borderRadius: 30,
        paddingVertical: 18, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    },
    saveBtnText: { color: colors.backgroundPrimary, fontSize: 16, fontWeight: '700' },
});
