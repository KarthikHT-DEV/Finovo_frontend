import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Animated,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme, getContrastIconColor } from '../styles/theme';
import { getStyles } from '../styles/HomeScreen.styles';
import dashboardService from '../services/dashboardService';
import BottomNav from '../components/BottomNav';
import { MEDIA_BASE_URL } from '../constants/api';

// Split amount string '$4,250.00' into '$4,250' and '.00'
const formatAmountSplit = (amountStr, symbol = '$') => {
    const num = parseFloat(amountStr || '0').toFixed(2);
    const parts = num.split('.');
    return {
        whole: symbol + parseInt(parts[0], 10).toLocaleString(),
        decimal: '.' + parts[1],
    };
};

// Date formatter for transactions (e.g. "Today", "Yesterday", or "Oct 24")
const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Simple SVG Donut Chart component using strokeDasharray
const DonutChart = ({ data, savedPercentage, colors, styles }) => {
    const radius = 36;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const size = (radius + strokeWidth) * 2; // 88

    // Calculate total amount to get percentages
    const total = data.reduce((sum, item) => sum + item.amount, 0);

    let currentAngle = -90; // Start at 12 o'clock

    return (
        <View style={styles.chartContainer}>
            <Svg width={size} height={size}>
                <G rotation={0} origin={`${size / 2}, ${size / 2}`}>
                    {/* Background circle of chart */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.backgroundPrimary}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {data.map((slice, index) => {
                        if (total === 0 || slice.amount === 0) return null;
                        const percentage = slice.amount / total;
                        const strokeDasharray = `${circumference * percentage} ${circumference}`;
                        const rotation = currentAngle;
                        currentAngle += percentage * 360;

                        return (
                            <Circle
                                key={index}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={slice.color}
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={0}
                                origin={`${size / 2}, ${size / 2}`}
                                rotation={rotation}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </G>
            </Svg>

            <View style={styles.chartInnerContent}>
                <Text style={styles.chartLabel}>SAVED</Text>
                <Text style={styles.chartValue}>{savedPercentage}%</Text>
            </View>
        </View>
    );
};


export default function HomeScreen({ onNavigate, onEditTransaction }) {
    const { colors, formatCurrency, currency } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = React.useMemo(() => getStyles(colors, insets), [colors, insets]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBalanceVisible, setIsBalanceVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await dashboardService.getDashboardData();
            setData(res);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        } catch (e) {
            console.warn("Failed to load dashboard data", e);
        } finally {
            setLoading(false);
        }
    }, [fadeAnim]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading || !data) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    const balParts = formatAmountSplit(data.total_balance, currency.symbol);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* ── Header ── */}
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <Pressable style={styles.miniAvatarWrapper} onPress={() => onNavigate('account_settings')}>
                                {data.avatar_url ? (
                                    <Image
                                        source={{
                                            uri: data.avatar_url.startsWith('http')
                                                ? data.avatar_url
                                                : `${MEDIA_BASE_URL}${data.avatar_url}`
                                        }}
                                        style={styles.miniAvatarImage}
                                    />
                                ) : (
                                    <Text style={styles.miniAvatarInitials}>
                                        {data.first_name ? data.first_name.charAt(0).toUpperCase() : '?'}
                                    </Text>
                                )}
                            </Pressable>
                            <View>
                                <Text style={styles.greetingSubtitle}>Welcome back</Text>
                                <Text style={styles.greetingTitle}>{data.first_name}</Text>
                            </View>
                        </View>
                        <Pressable style={styles.notificationIcon} onPress={() => onNavigate('notifications')}>
                            <MaterialCommunityIcons name="bell" size={26} color={colors.textPrimary} />
                            {data.unread_notifications > 0 && <View style={styles.notificationDot} />}
                        </Pressable>
                    </View>

                    {/* ── Dark Total Balance Card ── */}
                    <View style={styles.balanceCard}>
                        <View style={styles.balanceHeader}>
                            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
                            <Pressable style={styles.menuButton} onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
                                <MaterialCommunityIcons name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textInvPrimary} />
                            </Pressable>
                        </View>

                        <View style={styles.balanceAmountRow}>
                            <Text style={styles.balanceAmountWhole}>{isBalanceVisible ? balParts.whole : '••••'}</Text>
                            <Text style={styles.balanceAmountDecimal}>{isBalanceVisible ? balParts.decimal : ''}</Text>
                        </View>

                        <View style={styles.flowRow}>
                            {/* Income Chip */}
                            <View style={styles.flowChip}>
                                <View style={styles.flowLabelRow}>
                                    <MaterialCommunityIcons name="arrow-down-circle" size={16} color={colors.textSuccess} />
                                    <Text style={styles.flowLabel}>Income</Text>
                                </View>
                                <Text style={styles.flowAmount}>{isBalanceVisible ? formatCurrency(data.income_total) : '••••'}</Text>
                            </View>

                            {/* Expense Chip */}
                            <View style={styles.flowChip}>
                                <View style={styles.flowLabelRow}>
                                    <MaterialCommunityIcons name="arrow-up-circle" size={16} color={colors.textDanger} />
                                    <Text style={styles.flowLabel}>Expenses</Text>
                                </View>
                                <Text style={styles.flowAmount}>{isBalanceVisible ? formatCurrency(data.expenses_total) : '••••'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Spending Analytics Card ── */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Spending</Text>
                        <Pressable hitSlop={10} onPress={() => onNavigate('analytics')}>
                            <Text style={styles.seeAnalytics}>See Analytics</Text>
                        </Pressable>
                    </View>

                    {data.spending_categories && data.spending_categories.length > 0 && (
                        <Pressable style={styles.spendingCard} onPress={() => onNavigate('analytics')}>
                            <DonutChart data={data.spending_categories} savedPercentage={data.saved_percentage || 0} colors={colors} styles={styles} />

                            <View style={styles.legendContainer}>
                                {data.spending_categories.map((cat, i) => (
                                    <View key={i} style={styles.legendItem}>
                                        <View style={styles.legendDotLabelRow}>
                                            <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                                            <Text style={styles.legendLabel}>{cat.name}</Text>
                                        </View>
                                        <Text style={styles.legendAmount}>{currency.symbol}{parseFloat(cat.amount).toLocaleString()}</Text>
                                    </View>
                                ))}
                            </View>
                        </Pressable>
                    )}

                    {/* ── Recent Transactions List ── */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    </View>

                    {data.recent_transactions.map((t, idx) => {
                        const isNegative = typeof t.amount === 'string' ? !t.amount.startsWith('-') && t.category?.type === 'EXPENSE' : t.category?.type === 'EXPENSE';
                        const amountColor = t.category?.type === 'EXPENSE' ? colors.textPrimary : colors.textSuccess;

                        return (
                            <Pressable key={t.id} style={styles.transactionCard} onPress={() => onEditTransaction?.(t)}>
                                <View style={[styles.transactionIconBox, { backgroundColor: t.category.color }]}>
                                    <MaterialCommunityIcons
                                        name={t.category.icon_name}
                                        size={22}
                                        color={getContrastIconColor(t.category.color, colors.backgroundPrimary === '#121212')}
                                    />
                                </View>

                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionName}>{t.description}</Text>
                                    <Text style={styles.transactionSubtitle}>
                                        {t.category.name} • {formatTransactionDate(t.date)}
                                    </Text>
                                </View>

                                <Text style={[styles.transactionAmount, { color: amountColor }]}>
                                    {t.category.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.amount)}
                                </Text>
                            </Pressable>
                        );
                    })}
                </Animated.View>
            </ScrollView>

            {/* Floating Bottom Navigation */}
            <BottomNav
                activeTab="home"
                onTabChange={onNavigate}
            />
        </View>
    );
}
