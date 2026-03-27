import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';

const TABS = [
    { key: 'home', label: 'Home', icon: 'home-variant', iconOff: 'home-variant-outline' },
    { key: 'analytics', label: 'Analytics', icon: 'chart-bar', iconOff: 'chart-bar' },
    { key: 'add', label: null, icon: 'plus', iconOff: 'plus' },   // FAB
    { key: 'favorites', label: 'Favorites', icon: 'star', iconOff: 'star-outline' },
    { key: 'profile', label: 'Profile', icon: 'account', iconOff: 'account-outline' },
];

export default function BottomNav({ activeTab = 'home', onTabChange }) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(8, insets.bottom);
    const styles = React.useMemo(() => getStyles(colors, bottomPadding), [colors, bottomPadding]);

    return (
        <View style={styles.wrapper}>
            {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const isFab = tab.key === 'add';

                if (isFab) {
                    return (
                        <View key="add" style={styles.fabContainer}>
                            <Pressable style={styles.fab} onPress={() => onTabChange?.('add')}>
                                <MaterialCommunityIcons name="plus" size={30} color="#fff" />
                            </Pressable>
                        </View>
                    );
                }

                return (
                    <Pressable
                        key={tab.key}
                        style={styles.tabBtn}
                        onPress={() => onTabChange?.(tab.key)}
                    >
                        <MaterialCommunityIcons
                            name={isActive ? tab.icon : tab.iconOff}
                            size={24}
                            color={isActive ? colors.accent : colors.textMuted}
                        />
                        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                            {tab.label}
                        </Text>
                        {isActive && <View style={styles.activeDot} />}
                    </Pressable>
                );
            })}
        </View>
    );
}

const getStyles = (colors, bottomPadding) => StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 68 + bottomPadding,
        backgroundColor: colors.backgroundCard,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: bottomPadding,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 12,
    },
    tabBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
        gap: 2,
    },
    tabLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '500',
    },
    tabLabelActive: {
        color: colors.accent,
        fontWeight: '700',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.accent,
        marginTop: 1,
    },
    fabContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -32,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.backgroundCardDark,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
});
