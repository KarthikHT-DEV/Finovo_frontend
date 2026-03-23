import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View, Text, ScrollView, Pressable, ActivityIndicator,
    Animated, Dimensions, StyleSheet, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Svg, Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import analyticsService from '../services/analyticsService';
import transactionService from '../services/transactionService';
import BottomNav from '../components/BottomNav';
import CalendarRangePicker from '../components/CalendarRangePicker';
import { useTheme, getContrastIconColor } from '../styles/theme';

const { width } = Dimensions.get('window');



export default function AnalyticsScreen({ onBack, onNavigate, onReportPreview, onTransactionInfo }) {
    const { colors, formatCurrency } = useTheme();
    const ACCENT = colors.accent;
    const BG = colors.backgroundPrimary;
    const CARD_BG = colors.backgroundCard;
    const DARK = colors.textPrimary;
    const MUTED = colors.textSecondary;
    const ICON_BG = colors.backgroundPrimary === '#121212' ? '#2A2A2A' : '#F0EBE0';
    const insets = useSafeAreaInsets();
    const s = React.useMemo(() => getStyles(colors, insets, ACCENT, BG, CARD_BG, DARK, MUTED), [colors, insets]);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('month');
    const [pendingTimeframe, setPendingTimeframe] = useState('month'); // For unapplied modal
    const [filterVisible, setFilterVisible] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);
    // Year tracking removed since we use last 12 months rolling relative to today

    // Custom date states
    const [customStart, setCustomStart] = useState(null);
    const [customEnd, setCustomEnd] = useState(null);
    const [appliedStart, setAppliedStart] = useState(null);
    const [appliedEnd, setAppliedEnd] = useState(null);

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [pendingCategories, setPendingCategories] = useState([]); // Temporary selection
    const [categories, setCategories] = useState([]);
    const [catModalVisible, setCatModalVisible] = useState(false);
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
    const [pendingPaymentMethods, setPendingPaymentMethods] = useState([]); // Temporary selection
    const [pmModalVisible, setPmModalVisible] = useState(false);

    // Category Drill-down states
    const [selectedCatForTxns, setSelectedCatForTxns] = useState(null);
    const [catTxns, setCatTxns] = useState([]);
    const [loadingCatTxns, setLoadingCatTxns] = useState(false);
    const [catTxnsModalVisible, setCatTxnsModalVisible] = useState(false);

    const PAYMENT_METHODS = [
        { id: 'CARD', label: 'Card', icon: 'credit-card-outline' },
        { id: 'UPI', label: 'UPI', icon: 'qrcode-scan' },
        { id: 'CASH', label: 'Cash', icon: 'cash' },
        { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'bank-transfer' },
        { id: 'CHEQUE', label: 'Cheque', icon: 'checkbook' },
        { id: 'OTHER', label: 'Other', icon: 'dots-horizontal' },
    ];

    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Interactive Chart State
    const [activeBar, setActiveBar] = useState(null);

    // Pinch Gestures
    const baseScale = useRef(new Animated.Value(1)).current;
    const pinchScale = useRef(new Animated.Value(1)).current;
    const scale = Animated.multiply(baseScale, pinchScale);

    const onPinchEvent = Animated.event(
        [{ nativeEvent: { scale: pinchScale } }],
        { useNativeDriver: false }
    );

    const onPinchStateChange = event => {
        if (event.nativeEvent.state === State.END) {
            // Evaluate the new scale
            // Extracting value from multiply is tricky without listener,
            // so we'll recalculate dynamically based on zoomScale React State if we want persistent re-renders,
            // BUT for smooth performance we just update baseScale value
            const newScale = Math.max(0.75, Math.min(zoomScale * event.nativeEvent.scale, 4));
            setZoomScale(newScale);
            baseScale.setValue(1);
            pinchScale.setValue(1);
        }
    };

    const load = useCallback(async () => {
        try {
            setLoading(true);

            const formatDateLocal = (d) => {
                if (!d) return null;
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const sd = formatDateLocal(appliedStart);
            const ed = appliedEnd ? formatDateLocal(appliedEnd) : sd;

            const res = await analyticsService.getAnalytics(
                timeframe, selectedCategories, sd, ed, null, selectedPaymentMethods
            );
            setData(res);

            // Auto select latest/highest as active bar initially if not set
            if (res?.weekly_data?.length > 0) {
                const maxW = [...res.weekly_data].sort((a, b) => b.amount - a.amount)[0];
                setActiveBar(maxW);
            }

            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        } catch (e) {
            console.warn('Analytics load failed', e);
        } finally {
            setLoading(false);
        }
    }, [fadeAnim, timeframe, selectedCategories, selectedPaymentMethods, appliedStart, appliedEnd]);

    const fetchCatTxns = async (category) => {
        try {
            setLoadingCatTxns(true);
            setSelectedCatForTxns(category);
            setCatTxnsModalVisible(true);
            // Fetch using the range that the analytics currently covers
            const txns = await transactionService.getTransactions({
                categoryId: category.id,
                startDate: data?.start_date,
                endDate: data?.end_date,
                paymentMethods: selectedPaymentMethods
            });
            setCatTxns(txns);
        } catch (e) {
            console.warn('Failed to fetch category transactions', e);
        } finally {
            setLoadingCatTxns(false);
        }
    };

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const cats = await transactionService.getCategories();
                setCategories(cats.filter(c => c.type === 'EXPENSE'));
            } catch (e) {
                console.warn('Failed to load categories', e);
            }
        };
        fetchCats();
    }, []);

    const handleTab = (tab) => {
        if (tab !== 'analytics') onNavigate?.(tab);
    };

    const handleApplyFilter = () => {
        setTimeframe(pendingTimeframe);
        if (pendingTimeframe === 'custom') {
            setAppliedStart(customStart);
            setAppliedEnd(customEnd);
        } else {
            setAppliedStart(null);
            setAppliedEnd(null);
        }
        setFilterVisible(false);
    };

    const handleRangeChange = (start, end) => {
        setCustomStart(start);
        setCustomEnd(end);
        setPendingTimeframe('custom');
    };

    if (loading || !data) {
        return (
            <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={DARK} />
            </View>
        );
    }

    // Bar chart max for scaling
    const maxWeek = Math.max(...data.weekly_data.map(w => w.amount), 1);

    return (
        <View style={s.container}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* ── Header ── */}
                    <View style={s.headerRow}>
                        <Pressable onPress={onBack} hitSlop={12}>
                            <MaterialCommunityIcons name="arrow-left" size={26} color={DARK} />
                        </Pressable>
                        <Text style={s.headerTitle}>Analytics</Text>
                        <View style={{ width: 26 }} />
                    </View>

                    {/* ── Filter Row ── */}
                    <View style={{ marginBottom: 24 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
                            <Pressable style={[s.filterChip, { justifyContent: 'center' }]} onPress={() => {
                            setPendingTimeframe(timeframe);
                            setCustomStart(appliedStart);
                            setCustomEnd(appliedEnd);
                            setFilterVisible(true);
                        }}>
                            <Text style={s.filterChipText}>
                                {timeframe === 'week' ? 'Weekly' : timeframe === 'month' ? 'Monthly' : timeframe === 'last_3_months' ? '3 Months' : timeframe === 'year' ? '12 Months' : 'Custom'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={16} color={DARK} />
                        </Pressable>

                        {/* Payment Method filter chip */}
                        <Pressable
                            style={[s.filterChip, { justifyContent: 'center' }, selectedPaymentMethods.length > 0 && { backgroundColor: ACCENT }]}
                            onPress={() => {
                                setPendingPaymentMethods([...selectedPaymentMethods]);
                                setPmModalVisible(true);
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialCommunityIcons
                                    name={selectedPaymentMethods.length === 1 ? (PAYMENT_METHODS.find(m => m.id === selectedPaymentMethods[0])?.icon || 'contactless-payment') : 'contactless-payment'}
                                    size={18}
                                    color={selectedPaymentMethods.length > 0 ? '#fff' : DARK}
                                />
                                <Text style={[s.filterChipText, selectedPaymentMethods.length > 0 && { color: '#fff' }]}>
                                    {selectedPaymentMethods.length === 0 ? 'Payment' : selectedPaymentMethods.length === 1 ? PAYMENT_METHODS.find(m => m.id === selectedPaymentMethods[0])?.label : `${selectedPaymentMethods.length}`}
                                </Text>
                            </View>
                            {selectedPaymentMethods.length > 0 && (
                                <Pressable
                                    onPress={(e) => { e.stopPropagation?.(); setSelectedPaymentMethods([]); }}
                                    style={{ marginLeft: 4, padding: 2 }}
                                >
                                    <MaterialCommunityIcons name="close-circle" size={14} color="#fff" />
                                </Pressable>
                            )}
                        </Pressable>

                        {/* Category filter chip */}
                        <Pressable
                            style={[s.filterChip, { justifyContent: 'center' }, selectedCategories.length > 0 && { backgroundColor: ACCENT }]}
                            onPress={() => {
                                setPendingCategories([...selectedCategories]);
                                setCatModalVisible(true);
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialCommunityIcons
                                    name={selectedCategories.length === 1 ? (categories.find(c => c.id === selectedCategories[0])?.icon_name || 'shape-outline') : 'shape-outline'}
                                    size={18}
                                    color={selectedCategories.length > 0 ? '#fff' : DARK}
                                />
                                <Text style={[s.filterChipText, selectedCategories.length > 0 && { color: '#fff' }]}>
                                    {selectedCategories.length === 0 ? 'Category' : selectedCategories.length === 1 ? (categories.find(c => c.id === selectedCategories[0])?.name) : `${selectedCategories.length}`}
                                </Text>
                            </View>
                            {selectedCategories.length > 0 && (
                                <Pressable
                                    onPress={(e) => { e.stopPropagation?.(); setSelectedCategories([]); }}
                                    style={{ marginLeft: 4, padding: 2 }}
                                >
                                    <MaterialCommunityIcons name="close-circle" size={14} color="#fff" />
                                </Pressable>
                            )}
                        </Pressable>
                        </ScrollView>
                    </View>

                    {/* ── Stat Cards ── */}
                    <View style={s.statRow}>
                        {/* Spent */}
                        <View style={s.statCard}>
                            <View style={s.statIconRow}>
                                <View style={s.statIconBg}>
                                    <MaterialCommunityIcons name="cash-minus" size={16} color={ACCENT} />
                                </View>
                                <Text style={s.statLabel}>SPENT</Text>
                            </View>
                            <Text style={s.statAmount}>{formatCurrency(data.spent_total)}</Text>
                            <Text style={s.statSub}>This month</Text>
                        </View>

                        {/* Budget */}
                        <Pressable style={s.statCard} onPress={() => onNavigate?.('set_budget')}>
                            <View style={s.statIconRow}>
                                <View style={s.statIconBg}>
                                    <MaterialCommunityIcons name="wallet-outline" size={16} color={ACCENT} />
                                </View>
                                <Text style={s.statLabel}>BUDGET LEFT</Text>
                            </View>
                            <Text style={s.statAmount}>
                                {data.budget_total > 0
                                    ? formatCurrency(Math.max(0, data.budget_total - data.spent_total))
                                    : '—'
                                }
                            </Text>
                            {data.budget_total > 0 && (
                                <View style={s.onTrackRow}>
                                    <Text style={s.statSub}>of {formatCurrency(data.budget_total)} limit</Text>
                                </View>
                            )}
                            {data.budget_total === 0 && (
                                <Text style={s.statSub}>No budget set</Text>
                            )}
                        </Pressable>
                    </View>

                    {/* ── Overview Chart ── */}
                    <View style={s.sectionHeaderRow}>
                        <Text style={s.sectionTitle}>{timeframe === 'year' ? '12 Month Overview' : 'Overview'}</Text>
                        <Pressable hitSlop={8} onPress={() => onReportPreview?.({
                            data,
                            timeframeText: timeframe === 'week' ? 'WEEKLY OVERVIEW' :
                                timeframe === 'month' ? 'MONTHLY OVERVIEW' :
                                    timeframe === 'last_3_months' ? '3 MONTH OVERVIEW' :
                                        timeframe === 'year' ? '12 MONTH OVERVIEW' : 'CUSTOM OVERVIEW',
                            monthLabel: data.month_label
                        })}>
                            <Text style={s.fullReport}>FULL REPORT</Text>
                        </Pressable>
                    </View>
                    <Text style={{ fontSize: 14, color: MUTED, fontWeight: '600', marginBottom: 12, marginTop: -8 }}>
                        {data.month_label}
                    </Text>

                    <View style={s.chartCard}>
                        {((timeframe !== 'year' && data.weekly_data.length > 10) || (timeframe === 'custom' && data.weekly_data.length > 12)) ? (() => {
                            const minSpacing = 65; // pixels per node
                            const baseW = Math.max(width - 80, data.weekly_data.length * minSpacing);
                            const chartWidth = baseW * zoomScale;
                            const chartHeight = 180;

                            // Calculate points
                            const points = data.weekly_data.map((item, index) => {
                                const x = (index / Math.max(1, data.weekly_data.length - 1)) * (chartWidth - 40) + 20;
                                const hPct = maxWeek > 0 ? (item.amount / maxWeek) : 0;
                                const y = chartHeight - (hPct * chartHeight) + 10;
                                return { x, y, label: item.label, amount: item.amount, income_amount: item.income_amount, isMax: item.amount === maxWeek && maxWeek > 0 };
                            });

                            const pathData = points.length > 0
                                ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
                                : '';

                            const fillPath = points.length > 0
                                ? `${pathData} L ${points[points.length - 1].x} ${chartHeight + 40} L ${points[0].x} ${chartHeight + 40} Z`
                                : '';

                            return (
                                <View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}
                                        scrollEventThrottle={16}
                                    >
                                        <PinchGestureHandler
                                            onGestureEvent={onPinchEvent}
                                            onHandlerStateChange={onPinchStateChange}
                                        >
                                            <Animated.View style={{ width: chartWidth, height: chartHeight + 44, transform: [{ scaleX: scale }], transformOrigin: 'left' }}>
                                                <Svg width={chartWidth} height={chartHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
                                                    <Defs>
                                                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                                            <Stop offset="0" stopColor={ACCENT} stopOpacity="0.3" />
                                                            <Stop offset="1" stopColor={ACCENT} stopOpacity="0" />
                                                        </LinearGradient>
                                                    </Defs>
                                                    {points.length > 0 && <Path d={fillPath} fill="url(#grad)" />}
                                                    {points.length > 0 && <Path d={pathData} stroke={ACCENT} strokeWidth="3" fill="none" />}
                                                    {points.map((p, i) => (
                                                        <G key={'g' + i}>
                                                            <Circle
                                                                cx={p.x} cy={p.y} r={activeBar?.label === p.label ? "8" : "5"}
                                                                fill={activeBar?.label === p.label ? DARK : "#FFF"}
                                                                stroke={ACCENT}
                                                                strokeWidth="2"
                                                            />
                                                            <Circle
                                                                cx={p.x} cy={p.y} r="28"
                                                                fill="transparent"
                                                                onPress={() => setActiveBar(p)}
                                                            />
                                                        </G>
                                                    ))}
                                                </Svg>
                                                {/* X-axis labels */}
                                                {points.map((p, i) => (
                                                    <View key={'t' + i} style={{ position: 'absolute', left: p.x - 22, top: chartHeight + 4, width: 44, alignItems: 'center' }}>
                                                        <Text style={{ fontSize: 10, color: MUTED, fontWeight: '500' }} numberOfLines={1}>{p.label}</Text>
                                                    </View>
                                                ))}
                                            </Animated.View>
                                        </PinchGestureHandler>
                                    </ScrollView>
                                </View>
                            );
                        })() : (
                            /* Bars */
                            <ScrollView
                                horizontal={data.weekly_data.length > 5}
                                showsHorizontalScrollIndicator={false}
                                bounces={false}
                                contentContainerStyle={data.weekly_data.length <= 5 && { flex: 1 }}
                            >
                                <View style={[s.barsRow, data.weekly_data.length > 5 ? { gap: 12, paddingHorizontal: 10 } : { justifyContent: 'space-between', paddingHorizontal: 20, flex: 1 }]}>
                                    {data.weekly_data.map((week, i) => {
                                        const pct = week.amount / maxWeek;
                                        const isMax = week.amount === maxWeek && week.amount > 0;
                                        const isActive = activeBar?.label === week.label;
                                        return (
                                            <Pressable
                                                key={week.label}
                                                style={[s.barCol, data.weekly_data.length > 5 ? { width: 48, flex: 0 } : { flex: 0, width: 60 }]}
                                                onPress={() => setActiveBar(week)}
                                            >
                                                <View style={s.barTrack}>
                                                    <View
                                                        style={[
                                                            s.barFill,
                                                            { height: `${Math.max(pct * 100, 4)}%` },
                                                            isActive ? { backgroundColor: DARK } : (isMax && s.barFillActive),
                                                        ]}
                                                    />
                                                </View>
                                                <Text style={[s.barLabel, (isMax || isActive) && s.barLabelActive]} numberOfLines={1}>
                                                    {week.label}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        )}
                    </View>

                    {/* Interactive Parallel Cards */}
                    {
                        activeBar && (
                            <Animated.View style={s.parallelCardsRow}>
                                <View style={s.activeCard}>
                                    <View style={[s.activeCardIcon, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                                        <MaterialCommunityIcons name="arrow-bottom-left" size={20} color="#4CAF50" />
                                    </View>
                                    <View style={{ flex: 1, marginTop: 8 }}>
                                        <Text style={s.activeCardTitle}>Income</Text>
                                        <Text style={s.activeCardLabel}>{activeBar.label}</Text>
                                        <Text style={[s.activeCardAmount, { color: '#4CAF50' }]}>{formatCurrency(activeBar.income_amount || 0)}</Text>
                                    </View>
                                </View>

                                <View style={s.activeCard}>
                                    <View style={[s.activeCardIcon, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}>
                                        <MaterialCommunityIcons name="arrow-top-right" size={20} color="#F44336" />
                                    </View>
                                    <View style={{ flex: 1, marginTop: 8 }}>
                                        <Text style={s.activeCardTitle}>Expense</Text>
                                        <Text style={s.activeCardLabel}>{activeBar.label}</Text>
                                        <Text style={[s.activeCardAmount, { color: '#F44336' }]}>{formatCurrency(activeBar.amount || 0)}</Text>
                                    </View>
                                </View>
                            </Animated.View>
                        )
                    }

                    {/* ── Top Categories ── */}
                    <View style={s.sectionHeaderRow}>
                        <Text style={s.sectionTitle}>Top Categories</Text>
                    </View>

                    {
                        data.top_categories.length === 0 && (
                            <View style={s.emptyCard}>
                                <Text style={s.emptyText}>No expense transactions yet.</Text>
                                <Text style={[s.emptyText, { fontSize: 12, marginTop: 4 }]}>Add transactions to see your spending breakdown.</Text>
                            </View>
                        )
                    }

                    {
                        data.top_categories.map((cat, i) => (
                            <Pressable
                                key={i}
                                style={s.catCard}
                                onPress={() => fetchCatTxns(cat)}
                            >
                                <View style={[s.catIconBg, { backgroundColor: cat.color || '#F5EDD8' }]}>
                                    <MaterialCommunityIcons
                                        name={cat.icon_name}
                                        size={22}
                                        color={getContrastIconColor(cat.color)}
                                    />
                                </View>
                                <View style={s.catInfo}>
                                    <View style={s.catTopRow}>
                                        <Text style={s.catName}>{cat.name}</Text>
                                        <Text style={s.catAmount}>{formatCurrency(cat.amount)}</Text>
                                    </View>
                                    <View style={s.catBottomRow}>
                                        <Text style={s.catCount}>{cat.count} TRANSACTION{cat.count !== 1 ? 'S' : ''}</Text>
                                        <Text style={s.catPct}>{cat.percentage}%</Text>
                                    </View>
                                    {/* Progress bar */}
                                    <View style={s.catBarBg}>
                                        <View style={[s.catBarFill, { width: `${cat.percentage}%` }]} />
                                    </View>
                                </View>
                            </Pressable>
                        ))
                    }

                </Animated.View >
            </ScrollView >

            <BottomNav activeTab="analytics" onTabChange={handleTab} />

            {/* Fullscreen Date Range Modal */}
            <Modal
                visible={filterVisible}
                animationType="slide"
                onRequestClose={() => setFilterVisible(false)}
            >
                <View style={s.fullModalContainer}>
                    <View style={s.fullModalHeader}>
                        <Pressable onPress={() => setFilterVisible(false)} hitSlop={12} style={{ width: 40 }}>
                            <MaterialCommunityIcons name="close" size={28} color={DARK} />
                        </Pressable>
                        <Text style={s.fullModalTitle}>Select Date Range</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={s.fullModalScroll} showsVerticalScrollIndicator={false}>
                        {/* Radio options container */}
                        <View style={s.radioGroupDate}>

                            <Pressable style={[s.radioOptionFull, pendingTimeframe === 'week' && s.radioOptionActive]} onPress={() => setPendingTimeframe('week')}>
                                <Text style={s.radioTitleFull}>This Week</Text>
                                <View style={[s.radioCircle, pendingTimeframe === 'week' && s.radioCircleActive]}>
                                    {pendingTimeframe === 'week' && <View style={s.radioInner} />}
                                </View>
                            </Pressable>

                            <Pressable style={[s.radioOptionFull, pendingTimeframe === 'month' && s.radioOptionActive]} onPress={() => setPendingTimeframe('month')}>
                                <Text style={s.radioTitleFull}>This Month</Text>
                                <View style={[s.radioCircle, pendingTimeframe === 'month' && s.radioCircleActive]}>
                                    {pendingTimeframe === 'month' && <View style={s.radioInner} />}
                                </View>
                            </Pressable>

                            <Pressable style={[s.radioOptionFull, pendingTimeframe === 'last_3_months' && s.radioOptionActive]} onPress={() => setPendingTimeframe('last_3_months')}>
                                <Text style={s.radioTitleFull}>Last 3 Months</Text>
                                <View style={[s.radioCircle, pendingTimeframe === 'last_3_months' && s.radioCircleActive]}>
                                    {pendingTimeframe === 'last_3_months' && <View style={s.radioInner} />}
                                </View>
                            </Pressable>

                            <Pressable style={[s.radioOptionFull, pendingTimeframe === 'year' && s.radioOptionActive]} onPress={() => setPendingTimeframe('year')}>
                                <Text style={s.radioTitleFull}>Last 12 Months</Text>
                                <View style={[s.radioCircle, pendingTimeframe === 'year' && s.radioCircleActive]}>
                                    {pendingTimeframe === 'year' && <View style={s.radioInner} />}
                                </View>
                            </Pressable>

                        </View>

                        <Text style={s.customRangeTitle}>Custom Range</Text>

                        <CalendarRangePicker
                            startDate={customStart}
                            endDate={customEnd}
                            onRangeChange={handleRangeChange}
                        />

                    </ScrollView>

                    <View style={s.modalFooter}>
                        <Pressable style={s.applyButton} onPress={handleApplyFilter}>
                            <Text style={s.applyButtonText}>Apply Filter</Text>
                        </Pressable>
                        <Pressable
                            style={s.clearAllButton}
                            onPress={() => {
                                setPendingTimeframe('month');
                                setCustomStart(null);
                                setCustomEnd(null);
                                setAppliedStart(null);
                                setAppliedEnd(null);
                                setTimeframe('month');
                                setSelectedCategories([]);
                                setSelectedPaymentMethods([]);
                                setFilterVisible(false);
                            }}
                        >
                            <Text style={s.clearAllButtonText}>Clear Filters</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            {/* Category Filter Modal */}
            <Modal
                visible={catModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setCatModalVisible(false)}
            >
                <Pressable style={s.modalOverlay} onPress={() => setCatModalVisible(false)}>
                    <Pressable style={s.modalContent} onPress={e => e.stopPropagation?.()}>
                        <View style={s.modalDragHandle} />

                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Filter by Category</Text>
                            <Text style={s.modalSubtitle}>Long-press to select multiple categories</Text>
                        </View>

                        <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.5 }}>
                            <Pressable
                                style={[s.catFilterRow, pendingCategories.length === 0 && s.radioOptionActive]}
                                onPress={() => { setPendingCategories([]); setSelectedCategories([]); setCatModalVisible(false); }}
                            >
                                <Text style={s.radioTitle}>All Categories</Text>
                                <MaterialCommunityIcons name={pendingCategories.length === 0 ? "check-circle" : "circle-outline"} size={22} color={pendingCategories.length === 0 ? ACCENT : MUTED} />
                            </Pressable>

                            {categories.map(cat => {
                                const isSelected = pendingCategories.includes(cat.id);
                                return (
                                    <Pressable
                                        key={cat.id}
                                        style={[s.catFilterRow, isSelected && s.radioOptionActive]}
                                        onPress={() => {
                                            if (isSelected) {
                                                setPendingCategories(prev => prev.filter(id => id !== cat.id));
                                            } else {
                                                setPendingCategories(prev => [...prev, cat.id]);
                                            }
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <View style={[s.statIconBg, { backgroundColor: cat.color || ICON_BG }]}>
                                                <MaterialCommunityIcons
                                                    name={cat.icon_name}
                                                    size={16}
                                                    color={getContrastIconColor(cat.color || ICON_BG)}
                                                />
                                            </View>
                                            <Text style={s.radioTitle}>{cat.name}</Text>
                                        </View>
                                        <MaterialCommunityIcons
                                            name={isSelected ? "check-circle" : "circle-outline"}
                                            size={22}
                                            color={isSelected ? ACCENT : MUTED}
                                        />
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                        <View style={s.modalFooterRelative}>
                            <Pressable
                                style={s.applyButton}
                                onPress={() => {
                                    setSelectedCategories([...pendingCategories]);
                                    setCatModalVisible(false);
                                }}
                            >
                                <Text style={s.applyButtonText}>Apply Filter</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Payment Method Filter Modal */}
            <Modal
                visible={pmModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setPmModalVisible(false)}
            >
                <Pressable style={s.modalOverlay} onPress={() => setPmModalVisible(false)}>
                    <Pressable style={s.modalContent} onPress={e => e.stopPropagation?.()}>
                        <View style={s.modalDragHandle} />

                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Filter by Payment Method</Text>
                            <Text style={s.modalSubtitle}>Long-press to select multiple payment methods</Text>
                        </View>

                        <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.5 }}>
                            <Pressable
                                style={[s.catFilterRow, pendingPaymentMethods.length === 0 && s.radioOptionActive]}
                                onPress={() => { setPendingPaymentMethods([]); setSelectedPaymentMethods([]); setPmModalVisible(false); }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={[s.statIconBg, { backgroundColor: ICON_BG }]}>
                                        <MaterialCommunityIcons name="contactless-payment" size={16} color={DARK} />
                                    </View>
                                    <Text style={s.radioTitle}>All Methods</Text>
                                </View>
                                <MaterialCommunityIcons name={pendingPaymentMethods.length === 0 ? "check-circle" : "circle-outline"} size={22} color={pendingPaymentMethods.length === 0 ? ACCENT : MUTED} />
                            </Pressable>

                            {PAYMENT_METHODS.map(pm => {
                                const isSelected = pendingPaymentMethods.includes(pm.id);
                                return (
                                    <Pressable
                                        key={pm.id}
                                        style={[s.catFilterRow, isSelected && s.radioOptionActive]}
                                        onPress={() => {
                                            if (isSelected) {
                                                setPendingPaymentMethods(prev => prev.filter(id => id !== pm.id));
                                            } else {
                                                setPendingPaymentMethods(prev => [...prev, pm.id]);
                                            }
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <View style={[s.statIconBg, { backgroundColor: isSelected ? ACCENT + '22' : ICON_BG }]}>
                                                <MaterialCommunityIcons name={pm.icon} size={16} color={isSelected ? ACCENT : DARK} />
                                            </View>
                                            <Text style={s.radioTitle}>{pm.label}</Text>
                                        </View>
                                        <MaterialCommunityIcons
                                            name={isSelected ? "check-circle" : "circle-outline"}
                                            size={22}
                                            color={isSelected ? ACCENT : MUTED}
                                        />
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                        <View style={s.modalFooterRelative}>
                            <Pressable
                                style={s.applyButton}
                                onPress={() => {
                                    setSelectedPaymentMethods([...pendingPaymentMethods]);
                                    setPmModalVisible(false);
                                }}
                            >
                                <Text style={s.applyButtonText}>Apply Filter</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Category Transactions Drill-down Modal */}
            <Modal
                visible={catTxnsModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setCatTxnsModalVisible(false)}
            >
                <View style={s.modalOverlay}>
                    <View style={[s.modalContent, { height: '80%' }]}>
                        <View style={s.modalDragHandle} />

                        <View style={s.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={[s.catIconBg, { backgroundColor: selectedCatForTxns?.color || ICON_BG }]}>
                                    <MaterialCommunityIcons name={selectedCatForTxns?.icon_name} size={18} color={DARK} />
                                </View>
                                <View>
                                    <Text style={s.modalTitle}>{selectedCatForTxns?.name} Transactions</Text>
                                    <Text style={s.modalSubtitle}>{data?.month_label}</Text>
                                </View>
                            </View>
                        </View>

                        {loadingCatTxns ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={ACCENT} />
                            </View>
                        ) : (
                            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                                {catTxns.length === 0 ? (
                                    <Text style={{ textAlign: 'center', color: MUTED, marginTop: 40 }}>No transactions found for this range.</Text>
                                ) : (
                                    catTxns.map((txn, idx) => (
                                        <Pressable
                                            key={txn.id}
                                            style={s.txnRow}
                                            onPress={() => {
                                                setCatTxnsModalVisible(false);
                                                onTransactionInfo?.(txn);
                                            }}
                                        >
                                            <View style={s.txnLeft}>
                                                <Text style={s.txnDesc} numberOfLines={1}>{txn.description}</Text>
                                                <Text style={s.txnDate}>{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                                            </View>
                                            <View style={s.txnRight}>
                                                <Text style={s.txnAmt}>{formatCurrency(txn.amount)}</Text>
                                                <MaterialCommunityIcons name="chevron-right" size={18} color={MUTED} />
                                            </View>
                                        </Pressable>
                                    ))
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

        </View >
    );
}

const getStyles = (colors, insets, ACCENT, BG, CARD_BG, DARK, MUTED) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    scroll: { 
        paddingHorizontal: 20, 
        paddingTop: Math.max(insets?.top || 60, 20), 
        paddingBottom: Math.max(insets?.bottom || 0, 100) 
    },

    // Header
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },

    // Filters
    filterRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.backgroundPrimary === '#121212' ? '#1E1E1E' : '#FFFFFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    filterChipText: { fontSize: 13, fontWeight: '600', color: DARK },
    allAccountsChip: { backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    allAccountsText: { fontSize: 13, fontWeight: '600', color: '#FFF' },

    // Stat cards
    statRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
    statCard: { flex: 1, backgroundColor: CARD_BG, borderRadius: 20, padding: 16 },
    statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    statIconBg: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.progressTrack, alignItems: 'center', justifyContent: 'center' },
    statLabel: { fontSize: 11, fontWeight: '700', color: MUTED, letterSpacing: 0.8 },
    statAmount: { fontSize: 22, fontWeight: '800', color: DARK, marginBottom: 4 },
    statSub: { fontSize: 12, color: MUTED },
    onTrackRow: { flexDirection: 'row', alignItems: 'center' },

    // Section headers
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: DARK },
    fullReport: { fontSize: 12, fontWeight: '700', color: ACCENT, letterSpacing: 0.5 },

    // Bar chart
    chartCard: { backgroundColor: CARD_BG, borderRadius: 20, padding: 20, marginBottom: 28 },
    barsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140 },
    barCol: { flex: 1, alignItems: 'center', gap: 8 },
    barTooltip: { backgroundColor: DARK, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 4 },
    barTooltipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    barTrack: { width: 32, height: 100, backgroundColor: colors.progressTrack, borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
    barFill: { width: '100%', backgroundColor: colors.outlinedBorder, borderRadius: 10 },
    barFillActive: { backgroundColor: ACCENT },
    barLabel: { fontSize: 12, color: MUTED, fontWeight: '500' },
    barLabelActive: { color: DARK, fontWeight: '700' },
    parallelCardsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
    activeCard: { flex: 1, backgroundColor: colors.backgroundCard, padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    activeCardIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    activeCardTitle: { fontSize: 11, color: MUTED, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    activeCardLabel: { fontSize: 12, color: DARK, fontWeight: '600', marginBottom: 4 },
    activeCardAmount: { fontSize: 18, fontWeight: 'bold' },

    // Categories
    catCard: { backgroundColor: CARD_BG, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
    catIconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    catInfo: { flex: 1 },
    catTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    catName: { fontSize: 15, fontWeight: '700', color: DARK },
    catAmount: { fontSize: 15, fontWeight: '700', color: DARK },
    catBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    catCount: { fontSize: 11, color: MUTED, fontWeight: '500', letterSpacing: 0.4 },
    catPct: { fontSize: 12, color: ACCENT, fontWeight: '700' },
    catBarBg: { height: 4, backgroundColor: colors.progressTrack, borderRadius: 2, overflow: 'hidden' },
    catBarFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },

    txnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.divider },
    txnLeft: { flex: 1 },
    txnDesc: { fontSize: 15, fontWeight: '600', color: DARK, marginBottom: 2 },
    txnDate: { fontSize: 12, color: MUTED },
    txnRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    txnAmt: { fontSize: 15, fontWeight: '700', color: DARK },

    // Empty state
    emptyCard: { backgroundColor: CARD_BG, borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 10 },
    emptyText: { fontSize: 14, color: MUTED, textAlign: 'center', fontWeight: '500' },

    // Date Range Modal Styles
    fullModalContainer: { flex: 1, backgroundColor: colors.backgroundPrimary },
    fullModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Math.max(insets?.top || 50, 20), paddingBottom: 20 },
    fullModalTitle: { fontSize: 18, fontWeight: 'bold', color: DARK },
    fullModalScroll: { paddingHorizontal: 20, paddingBottom: Math.max(insets?.bottom || 0, 40) },
    radioGroupDate: { gap: 12, marginBottom: 32, marginTop: 10 },
    radioOptionFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.backgroundCard, padding: 20, borderRadius: 20 },
    radioTitleFull: { fontSize: 15, fontWeight: '600', color: DARK },

    // Checkbox circles
    radioOptionActive: { borderWidth: 1.5, borderColor: '#DFA626' },
    radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
    radioCircleActive: { borderColor: '#DFA626' },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#DFA626' },

    customRangeTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 16, marginTop: 10 },

    modalFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: Math.max(insets?.bottom || 0, 40), backgroundColor: colors.backgroundPrimary },
    modalFooterRelative: { paddingVertical: 16 },
    applyButton: { backgroundColor: DARK, borderRadius: 20, height: 60, alignItems: 'center', justifyContent: 'center' },
    applyButtonText: { color: colors.backgroundPrimary, fontSize: 16, fontWeight: '600' },

    // Category Filter Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 31, 54, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.backgroundPrimary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalDragHandle: { width: 40, height: 4, backgroundColor: '#D9D4CA', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
    modalHeader: { marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: DARK, marginBottom: 4 },
    modalSubtitle: { fontSize: 14, color: '#64748B' },
    radioTitle: { fontSize: 15, fontWeight: '600', color: DARK, marginBottom: 2 },
    catFilterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: colors.backgroundCard, borderRadius: 16, marginBottom: 8 },

    // Dropdown Modal Styles
    dropdownOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
    },
    dropdownContent: {
        backgroundColor: colors.backgroundCard, borderRadius: 16, padding: 16, width: '60%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 15, elevation: 10,
    },
    dropdownItem: { paddingVertical: 14, paddingHorizontal: 8, borderRadius: 12, marginVertical: 2 },
    dropdownItemActive: { backgroundColor: '#F8E8C7' },
    dropdownItemText: { fontSize: 16, color: DARK, textAlign: 'center', fontWeight: '500' },
    dropdownItemTextActive: { fontWeight: 'bold', color: ACCENT },
});
