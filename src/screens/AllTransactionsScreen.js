import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, getContrastIconColor } from '../styles/theme';
import { getStyles as getHomeStyles } from '../styles/HomeScreen.styles';
import transactionService from '../services/transactionService';

const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function AllTransactionsScreen({ onBack, onEditTransaction }) {
    const { colors, currency, formatCurrency } = useTheme();
    const insets = useSafeAreaInsets();
    const homeStyles = React.useMemo(() => getHomeStyles(colors, insets), [colors, insets]);
    
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await transactionService.getTransactions();
            setTransactions(res || []);
        } catch (e) {
            console.warn("Failed to load transactions", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleFavorite = async (txn) => {
        try {
            if (txn.is_favorite) {
                await transactionService.unmarkFavorite(txn.id);
                setTransactions(prev => prev.map(t => t.id === txn.id ? {...t, is_favorite: false} : t));
            } else {
                await transactionService.markFavorite(txn.id);
                setTransactions(prev => prev.map(t => t.id === txn.id ? {...t, is_favorite: true} : t));
            }
        } catch (error) {
            console.warn("Failed to toggle favorite", error);
        }
    };

    const renderTransaction = (t) => {
        const amountColor = t.category?.type === 'EXPENSE' ? colors.textPrimary : colors.textSuccess;
        
        return (
            <Pressable key={t.id} style={homeStyles.transactionCard} onPress={() => onEditTransaction?.(t)}>
                <View style={[homeStyles.transactionIconBox, { backgroundColor: t.category.color }]}>
                    <MaterialCommunityIcons 
                        name={t.category.icon_name} 
                        size={22} 
                        color={getContrastIconColor(t.category.color, colors.backgroundPrimary === '#121212')} 
                    />
                </View>
                
                <View style={homeStyles.transactionInfo}>
                    <Text style={homeStyles.transactionName}>{t.description}</Text>
                    <Text style={homeStyles.transactionSubtitle}>
                        {t.category.name} • {formatTransactionDate(t.date)}
                    </Text>
                </View>

                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Text style={[homeStyles.transactionAmount, { color: amountColor, marginBottom: 4 }]}>
                        {t.category.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.amount)}
                    </Text>
                    <Pressable hitSlop={15} onPress={(e) => { e.stopPropagation(); handleToggleFavorite(t); }}>
                        <MaterialCommunityIcons 
                            name={t.is_favorite ? "star" : "star-outline"} 
                            size={20} 
                            color={t.is_favorite ? "#FFD700" : colors.textMuted} 
                        />
                    </Pressable>
                </View>
            </Pressable>
        );
    };

    if (loading && transactions.length === 0) {
        return (
            <View style={[homeStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={homeStyles.container}>
            <View style={{ 
                paddingTop: insets.top + 20, 
                paddingHorizontal: 20, 
                paddingBottom: 16,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <Pressable onPress={onBack} hitSlop={10} style={{ marginRight: 15 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>All Transactions</Text>
            </View>
            
            <ScrollView contentContainerStyle={[homeStyles.scrollContent, { paddingTop: 0 }]} showsVerticalScrollIndicator={false}>
                {transactions.length > 0 ? (
                    transactions.map(renderTransaction)
                ) : (
                    <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 30 }}>No transactions found.</Text>
                )}
            </ScrollView>
        </View>
    );
}
