import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import transactionService from '../services/transactionService';
import { useTheme } from '../styles/theme';
import { useAlert } from '../contexts/AlertContext';
import { getStyles } from '../styles/AddTransactionScreen.styles';
import CalendarRangePicker from '../components/CalendarRangePicker';

export default function EditTransactionScreen({ transaction, onBack, onUpdate }) {
    const { colors, currency } = useTheme();
    const { showAlert } = useAlert();
    const insets = useSafeAreaInsets();
    const styles = React.useMemo(() => getStyles(colors, insets), [colors, insets]);
    const [type, setType] = useState('EXPENSE'); // 'INCOME' or 'EXPENSE'
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CARD');
    const [isFavorite, setIsFavorite] = useState(false);

    const INCOME_PM = [
        { id: 'BANK_TRANSFER', label: 'Bank', icon: 'bank-outline' },
        { id: 'UPI', label: 'UPI', icon: 'qrcode-scan' },
        { id: 'CHEQUE', label: 'Cheque', icon: 'checkbook' },
        { id: 'CASH', label: 'Cash', icon: 'cash' },
        { id: 'OTHER', label: 'Other', icon: 'dots-horizontal' }
    ];

    const EXPENSE_PM = [
        { id: 'CARD', label: 'Card', icon: 'credit-card-outline' },
        { id: 'UPI', label: 'UPI', icon: 'qrcode-scan' },
        { id: 'CASH', label: 'Cash', icon: 'cash' },
        { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'bank-transfer' },
        { id: 'OTHER', label: 'Other', icon: 'dots-horizontal' }
    ];

    const activeMethods = type === 'INCOME' ? INCOME_PM : EXPENSE_PM;

    const [loadingCats, setLoadingCats] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    // Animated values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (!transaction) return;

        // Initialize state from existing transaction
        const isExp = transaction.category?.type === 'EXPENSE';
        setType(isExp ? 'EXPENSE' : 'INCOME');

        // remove negative sign if it exists for edit input
        const cleanAmount = String(transaction.amount || '').replace('-', '');
        setAmount(cleanAmount);

        setDescription(transaction.description || '');
        if (transaction.date) setDate(new Date(transaction.date));
        if (transaction.payment_method) setPaymentMethod(transaction.payment_method);
        setIsFavorite(!!transaction.is_favorite);

        loadCategories(transaction.category?.id);
    }, [transaction]);

    const loadCategories = async (initialCatId) => {
        try {
            setLoadingCats(true);
            const data = await transactionService.getCategories();
            setCategories(data);

            if (initialCatId) {
                const found = data.find(c => c.id === initialCatId);
                if (found) setSelectedCategory(found);
            }

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 350,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        } catch (err) {
            console.warn('Failed to load categories', err);
            setError('Could not load categories. Please try again.');
        } finally {
            setLoadingCats(false);
        }
    };

    const availableCategories = categories.filter(c => c.type === type);

    useEffect(() => {
        if (availableCategories.length > 0 && !loadingCats) {
            const exists = availableCategories.find(c => c.id === selectedCategory?.id);
            if (!exists) setSelectedCategory(availableCategories[0]);
        }
        // Reset payment method if it's not valid for the newly selected type
        if (activeMethods && !activeMethods.find(m => m.id === paymentMethod)) {
            setPaymentMethod(activeMethods[0].id);
        }
    }, [type, availableCategories, loadingCats]);

    const handleSave = async () => {
        if (!amount || isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (!selectedCategory) {
            setError('Please select a category.');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await transactionService.updateTransaction(transaction.id, {
                amount,
                description: description || selectedCategory.name,
                category_id: selectedCategory.id,
                date: date.toISOString(),
                payment_method: paymentMethod,
                is_favorite: isFavorite,
            });

            onUpdate?.();
        } catch (err) {
            console.warn('Update failed', err);
            setError('Failed to update transaction.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        showAlert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            {
                confirmText: 'Delete',
                destructive: true,
                onConfirm: async () => {
                    try {
                        setDeleting(true);
                        await transactionService.deleteTransaction(transaction.id);
                        onUpdate();
                    } catch (err) {
                        showAlert('Error', 'Failed to delete transaction.');
                    } finally {
                        setDeleting(false);
                    }
                }
            }
        );
    };

    const handleAmountChange = (text) => {
        const cleaned = text.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) return;
        if (parts[1] && parts[1].length > 2) return;
        setAmount(cleaned);
    };

    const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : (Platform.OS === 'android' ? -200 : 0)}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { flexGrow: 1 },
                    keyboardVisible && { paddingBottom: 150 }
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <View style={styles.headerRow}>
                    <Pressable style={styles.headerLeft} onPress={onBack}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color={colors.textPrimary} />
                    </Pressable>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Edit Transaction</Text>
                    </View>
                    <Pressable style={styles.headerRight} onPress={onBack}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                </View>

                {loadingCats ? (
                    <ActivityIndicator size="large" color={colors.textPrimary} style={{ marginTop: 40 }} />
                ) : (
                    <Animated.View style={{ opacity: fadeAnim }}>

                        {/* ── Toggle (Income | Expense) ── */}
                        <View style={styles.toggleContainer}>
                            <Pressable
                                style={[styles.toggleButton, type === 'INCOME' && styles.toggleButtonActive]}
                                onPress={() => setType('INCOME')}
                            >
                                <Text style={[styles.toggleText, type === 'INCOME' && styles.toggleTextActive]}>
                                    Income
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.toggleButton, type === 'EXPENSE' && styles.toggleButtonActive]}
                                onPress={() => setType('EXPENSE')}
                            >
                                <Text style={[styles.toggleText, type === 'EXPENSE' && styles.toggleTextActive]}>
                                    Expense
                                </Text>
                            </Pressable>
                        </View>

                        {/* ── Amount Input ── */}
                        <View style={styles.amountSection}>
                            <Text style={styles.amountLabel}>Enter Amount</Text>
                            <View style={styles.amountInputRow}>
                                <Text style={[styles.currencySymbol, amount.length > 0 && styles.amountInputActive]}>
                                    {currency.symbol}
                                </Text>
                                <TextInput
                                    style={[styles.amountInput, amount.length > 0 && styles.amountInputActive]}
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    keyboardType="decimal-pad"
                                    placeholder="0.00"
                                    placeholderTextColor="#CBD5E1"
                                    autoFocus={false}
                                />
                            </View>
                        </View>

                        {/* ── Category Grid ── */}
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>Category</Text>
                        </View>

                        <View style={styles.categoryGrid}>
                            {availableCategories.map((cat) => {
                                const isSelected = selectedCategory?.id === cat.id;
                                return (
                                    <View key={cat.id} style={styles.categoryItem}>
                                        <Pressable
                                            style={[
                                                styles.categoryCircle,
                                                isSelected && styles.categoryCircleSelected
                                            ]}
                                            onPress={() => setSelectedCategory(cat)}
                                        >
                                            <MaterialCommunityIcons
                                                name={cat.icon_name}
                                                size={28}
                                                color={isSelected ? colors.backgroundPrimary : colors.textPrimary}
                                            />
                                        </Pressable>
                                        <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
                                            {cat.name}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* ── Payment Method ── */}
                        <Text style={styles.inputSectionLabel}>PAYMENT METHOD</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, marginBottom: 32 }}>
                            {activeMethods.map((pm) => {
                                const isSelected = paymentMethod === pm.id;
                                return (
                                    <Pressable
                                        key={pm.id}
                                        style={[styles.pmChip, isSelected && styles.pmChipSelected]}
                                        onPress={() => setPaymentMethod(pm.id)}
                                    >
                                        <MaterialCommunityIcons
                                            name={pm.icon}
                                            size={20}
                                            color={isSelected ? colors.backgroundPrimary : colors.textPrimary}
                                        />
                                        <Text style={[styles.pmText, isSelected && styles.pmTextSelected]}>{pm.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        {/* ── Date Picker ── */}
                        <Text style={styles.inputSectionLabel}>DATE</Text>
                        <Pressable style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dateText}>{formattedDate}</Text>
                            <MaterialCommunityIcons name="calendar-blank-outline" size={24} color={colors.textPrimary} />
                        </Pressable>

                        <Modal visible={showDatePicker} animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
                            <View style={styles.fullModalContainer}>
                                <View style={styles.fullModalHeader}>
                                    <Pressable onPress={() => setShowDatePicker(false)} hitSlop={12} style={{ width: 40 }}>
                                        <MaterialCommunityIcons name="close" size={28} color={colors.textPrimary} />
                                    </Pressable>
                                    <Text style={styles.fullModalTitle}>Select Date</Text>
                                    <View style={{ width: 40 }} />
                                </View>
                                <ScrollView contentContainerStyle={styles.fullModalScroll} showsVerticalScrollIndicator={false}>
                                    <CalendarRangePicker
                                        startDate={date}
                                        endDate={date}
                                        singleMode={true}
                                        onRangeChange={(d1) => {
                                            setDate(d1);
                                            setShowDatePicker(false);
                                        }}
                                    />
                                </ScrollView>
                            </View>
                        </Modal>

                        {/* ── Favorite Toggle ── */}
                        <Text style={[styles.inputSectionLabel, { marginTop: 8 }]}>FAVORITE</Text>
                        <Pressable 
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingLeft: 8 }}
                            onPress={() => setIsFavorite(!isFavorite)}
                            hitSlop={10}
                        >
                            <MaterialCommunityIcons 
                                name={isFavorite ? "star" : "star-outline"} 
                                size={28} 
                                color={isFavorite ? "#FFD700" : colors.textMuted} 
                            />
                            <Text style={{ marginLeft: 12, fontSize: 16, color: colors.textPrimary, fontWeight: '500' }}>
                                Mark as Favorite
                            </Text>
                        </Pressable>

                        {/* ── Notes Input ── */}
                        <Text style={styles.inputSectionLabel}>NOTES</Text>
                        <View style={styles.notesRow}>
                            <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.textSecondary} />
                            <TextInput
                                style={styles.notesInput}
                                placeholder="Add a note..."
                                placeholderTextColor={colors.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                    </Animated.View>
                )}
            </ScrollView>

            {!loadingCats && (
                <View style={[styles.stickyFooter, keyboardVisible && styles.stickyFooterKeyboard]}>
                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <Pressable
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color={colors.backgroundPrimary} />
                        ) : (
                            <Text style={styles.saveButtonText}>Update Transaction</Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={{ padding: 12, alignItems: 'center' }}
                        onPress={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator color={colors.textDanger} />
                        ) : (
                            <Text style={{ color: colors.textDanger, fontWeight: 'bold' }}>Delete Transaction</Text>
                        )}
                    </Pressable>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
