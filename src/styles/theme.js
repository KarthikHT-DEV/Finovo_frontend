import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightColors = {
    backgroundPrimary: '#F5F0E8',
    backgroundCard: '#FFFFFF',
    backgroundCardDark: '#1E1C18',
    textPrimary: '#1A1F36',
    textSecondary: '#9E9E9E',
    textMuted: '#AAAAAA',
    textSkip: '#888888',
    textSuccess: '#4CAF50',
    textDanger: '#D94F4F',
    textInvPrimary: '#FFFFFF',
    textInvSecondary: '#AFAFAF',
    inputBorder: '#DDD8CF',
    inputBorderFocused: '#C4A44A',
    inputPlaceholder: '#BBBBBB',
    inputLabel: '#2C2C2C',
    dotActive: '#1A1F36',
    dotInactive: '#C9C4BB',
    progressTrack: '#E0D9CF',
    progressFill: '#C4A44A',
    divider: '#E0D9CF',
    outlinedBorder: '#DDDAD4',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    accent: '#C4A44A',
    accentDark: '#A88A30',
};

export const darkColors = {
    backgroundPrimary: '#121212',
    backgroundCard: '#1C1C1E',
    backgroundCardDark: '#1A1F36',
    textPrimary: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textMuted: '#8E8E93',
    textSkip: '#888888',
    textSuccess: '#34C759',
    textDanger: '#FF3B30',
    textInvPrimary: '#FFFFFF',
    textInvSecondary: '#AFAFAF',
    inputBorder: '#38383A',
    inputBorderFocused: '#C4A44A',
    inputPlaceholder: '#636366',
    inputLabel: '#EBEBF5',
    dotActive: '#FFFFFF',
    dotInactive: '#636366',
    progressTrack: '#38383A',
    progressFill: '#C4A44A',
    divider: '#38383A',
    outlinedBorder: '#48484A',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    accent: '#C4A44A',
    accentDark: '#A88A30',
};

export const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸' },
    { code: 'INR', symbol: '₹', label: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'EUR', symbol: '€', label: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', label: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'KWD', symbol: 'kd', label: 'Kuwaiti Dinar', flag: '🇰🇼' },
    { code: 'AED', symbol: 'dh', label: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'SAR', symbol: 'sr', label: 'Saudi Riyal', flag: '🇸🇦' },
    { code: 'CNY', symbol: '¥', label: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', flag: '🇸🇬' },
    { code: 'KRW', symbol: '₩', label: 'Korean Won', flag: '🇰🇷' },
    { code: 'RUB', symbol: '₽', label: 'Russian Ruble', flag: '🇷🇺' },
    { code: 'BRL', symbol: 'R$', label: 'Brazilian Real', flag: '🇧🇷' },
    { code: 'ZAR', symbol: 'R', label: 'South African Rand', flag: '🇿🇦' },
    { code: 'TRY', symbol: '₺', label: 'Turkish Lira', flag: '🇹🇷' },
    { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah', flag: '🇮🇩' },
    { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit', flag: '🇲🇾' },
    { code: 'PHP', symbol: '₱', label: 'Philippine Peso', flag: '🇵🇭' },
    { code: 'THB', symbol: '฿', label: 'Thai Baht', flag: '🇹🇭' },
    { code: 'VND', symbol: '₫', label: 'Vietnamese Dong', flag: '🇻🇳' },
];

export const getContrastIconColor = (hexColor, isDark = false) => {
    if (!hexColor || hexColor === 'transparent') return isDark ? '#FFF' : '#1A1F36';
    const color = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? '#1A1F36' : '#FFFFFF';
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemTheme = useColorScheme();
    const [themePref, setThemePref] = useState('system');
    const [currency, setCurrency] = useState(CURRENCIES[0]); // Default to USD
    const [isDark, setIsDark] = useState(systemTheme === 'dark');

    // Load saved preferences
    useEffect(() => {
        const loadPrefs = async () => {
            const savedTheme = await AsyncStorage.getItem('themePref');
            if (savedTheme) setThemePref(savedTheme);

            const savedCurrencyCode = await AsyncStorage.getItem('currencyCode');
            if (savedCurrencyCode) {
                const found = CURRENCIES.find(c => c.code === savedCurrencyCode);
                if (found) setCurrency(found);
            }
        };
        loadPrefs();
    }, []);

    // Update isDark based on preference or system
    useEffect(() => {
        if (themePref === 'system') {
            setIsDark(systemTheme === 'dark');
        } else {
            setIsDark(themePref === 'dark');
        }
    }, [themePref, systemTheme]);

    const changeTheme = async (mode) => {
        setThemePref(mode);
        await AsyncStorage.setItem('themePref', mode);
    };

    const changeCurrency = async (newCurrency) => {
        setCurrency(newCurrency);
        await AsyncStorage.setItem('currencyCode', newCurrency.code);
    };

    const formatCurrency = (amount) => {
        const val = parseFloat(amount || 0);
        return `${currency.symbol}${val.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{
            colors,
            themePref,
            isDark,
            changeTheme,
            currency,
            changeCurrency,
            formatCurrency
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
export default lightColors;
