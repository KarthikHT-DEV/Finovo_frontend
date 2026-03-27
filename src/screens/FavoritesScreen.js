import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme, getContrastIconColor } from '../styles/theme';
import { getStyles as getHomeStyles } from '../styles/HomeScreen.styles';
import transactionService from '../services/transactionService';
import dashboardService from '../services/dashboardService';
import BottomNav from '../components/BottomNav';

const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function FavoritesScreen({ onNavigate, onEditTransaction }) {
    const { colors, currency, formatCurrency } = useTheme();
    const insets = useSafeAreaInsets();
    const homeStyles = React.useMemo(() => getHomeStyles(colors, insets), [colors, insets]);
    
    const [favorites, setFavorites] = useState([]);
    const [recentTxns, setRecentTxns] = useState([]);
    const [loading, setLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [favsRes, dashboardRes] = await Promise.all([
                transactionService.getTransactions({ isFavorite: true }),
                dashboardService.getDashboardData() // this gets recent transactions easily
            ]);
            setFavorites(favsRes);
            setRecentTxns(dashboardRes.recent_transactions || []);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        } catch (e) {
            console.warn("Failed to load favorites data", e);
        } finally {
            setLoading(false);
        }
    }, [fadeAnim]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleFavorite = async (txn) => {
        try {
            if (txn.is_favorite) {
                await transactionService.unmarkFavorite(txn.id);
                setFavorites(prev => prev.filter(t => t.id !== txn.id));
                setRecentTxns(prev => prev.map(t => t.id === txn.id ? {...t, is_favorite: false} : t));
            } else {
                await transactionService.markFavorite(txn.id);
                setFavorites(prev => [txn, ...prev]);
                setRecentTxns(prev => prev.map(t => t.id === txn.id ? {...t, is_favorite: true} : t));
                loadData();
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

    if (loading && favorites.length === 0) {
        return (
            <View style={[homeStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={homeStyles.container}>
            <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 16 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>Favorites</Text>
            </View>
            
            <ScrollView contentContainerStyle={homeStyles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    
                    {/* Saved Favorites Section */}
                    {favorites.length > 0 ? (
                        <>
                            <View style={[homeStyles.sectionHeaderRow, { marginTop: 0 }]}>
                                <Text style={homeStyles.sectionTitle}>Saved Favorites</Text>
                            </View>
                            {favorites.map(renderTransaction)}
                        </>
                    ) : (
                        <View style={{ padding: 20, alignItems: 'center', marginVertical: 20 }}>
                            <MaterialCommunityIcons name="star-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
                            <Text style={{ color: colors.textMuted, fontSize: 16 }}>No favorite transactions yet.</Text>
                        </View>
                    )}

                    {/* Recent Transactions Section */}
                    <View style={homeStyles.sectionHeaderRow}>
                        <Text style={homeStyles.sectionTitle}>Recent Transactions</Text>
                        <Pressable hitSlop={10} onPress={() => onNavigate('all_transactions')}>
                            <Text style={homeStyles.seeAnalytics}>Show All</Text>
                        </Pressable>
                    </View>
                    
                    {recentTxns.length > 0 ? (
                        recentTxns.map(renderTransaction)
                    ) : (
                        <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 10 }}>No recent transactions.</Text>
                    )}
                    
                    {/* Add extra padding at the bottom for BottomNav */}
                    <View style={{ height: 80 }} />
                </Animated.View>
            </ScrollView>

            <BottomNav activeTab="favorites" onTabChange={onNavigate} />
        </View>
    );
}
