import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, ScrollView, Pressable, TextInput,
    ActivityIndicator, Animated, Alert, StyleSheet,
    KeyboardAvoidingView, Platform, Image, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MEDIA_BASE_URL } from '../constants/api';

import userService from '../services/userService';
import authService from '../services/authService';
import BottomNav from '../components/BottomNav';
import { useTheme, CURRENCIES } from '../styles/theme';
import { useAlert } from '../contexts/AlertContext';

// ── Helper ────────────────────────────────────────────────────────────────────
const getInitials = (fn = '', ln = '') =>
    `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase() || '?';

// ── Field Row ─────────────────────────────────────────────────────────────────
function FieldRow({ label, value, onChangeText, keyboardType, editable = true, placeholder, s, MUTED }) {
    return (
        <View style={s.fieldBlock}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput
                style={[s.fieldInput, !editable && s.fieldInputDisabled]}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                editable={editable}
                placeholder={placeholder || ''}
                placeholderTextColor={MUTED}
                autoCorrect={false}
                autoCapitalize="none"
            />
            <View style={s.fieldDivider} />
        </View>
    );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AccountSettingsScreen({ onBack, onNavigate }) {
    const { colors, currency, changeCurrency } = useTheme();
    const { showAlert } = useAlert();
    const BG = colors.backgroundPrimary;
    const CARD = colors.backgroundCard;
    const DARK = colors.textPrimary;
    const ACCENT = colors.accent;
    const MUTED = colors.textSecondary;
    const BORDER = colors.divider;
    const insets = useSafeAreaInsets();
    const s = React.useMemo(() => getStyles(colors, BG, CARD, DARK, ACCENT, MUTED, BORDER, insets), [colors, insets]);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarUri, setAvatarUri] = useState(null);  // local picked URI

    // UI state
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userService.getProfile();
            setProfile(data);
            setFullName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
            setEmail(data.email || '');
            setPhone(data.phone_number || '');
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        } catch (e) {
            console.warn('Failed to load profile', e);
        } finally {
            setLoading(false);
        }
    }, [fadeAnim]);

    useEffect(() => { load(); }, [load]);

    // ── Avatar picker ─────────────────────────────────────────────────────────
    const handleVerifyEmail = async () => {
        try {
            await authService.sendOTP(email);
            showAlert('OTP Sent', 'A verification code has been sent to your terminal/email.', {
                onConfirm: () => onNavigate('verify_email')
            });
        } catch (err) {
            showAlert('Error', 'Failed to send verification code.');
        }
    };

    const handlePickPhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setAlertConfig({
                    title: 'Permission Required',
                    message: 'Allow photo access to change your profile picture.',
                    destructive: false
                });
                setAlertVisible(true);
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (!result.canceled && result.assets?.[0]?.uri) {
                setAvatarUri(result.assets[0].uri);
            }
        } catch (err) {
            console.warn('Image picker error:', err);
            Alert.alert('Error', 'Could not open photo library.');
        }
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        const parts = fullName.trim().split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';

        try {
            setSaving(true);

            // Build either JSON or FormData depending on if we have a new photo
            let payload;

            if (avatarUri && !avatarUri.startsWith('http')) {
                // We have a local picked URI — must use FormData
                payload = new FormData();
                payload.append('first_name', firstName);
                payload.append('last_name', lastName);
                payload.append('email', email.trim().toLowerCase());
                payload.append('phone_number', phone.trim());

                // Get filename and extension from URI
                const filename = avatarUri.split('/').pop() || 'photo.jpg';
                const match = /\.(\w+)(\?.*)?$/.exec(filename);
                const ext = match ? match[1].toLowerCase() : 'jpg';
                const type = `image/${ext === 'png' ? 'png' : 'jpeg'}`;

                payload.append('avatar', {
                    uri: avatarUri,
                    name: filename.split('?')[0], // strip query params if any
                    type,
                });
            } else {
                // Just regular JSON
                payload = {
                    first_name: firstName,
                    last_name: lastName,
                    email: email.trim().toLowerCase(),
                    phone_number: phone.trim(),
                };
            }

            const config = {};
            if (payload instanceof FormData) {
                config.headers = {
                    'Content-Type': 'multipart/form-data',
                };
            }

            await userService.updateProfile(payload, config);
            setAlertConfig({ title: 'Saved', message: 'Your profile has been updated.', destructive: false });
            setAlertVisible(true);

            // Reload profile to get the new avatar_url from server
            const updated = await userService.getProfile();
            setFullName(`${updated.first_name} ${updated.last_name}`.trim());
            setEmail(updated.email || '');
            setPhone(updated.phone_number || '');
            if (updated.avatar_url) {
                setAvatarUri(updated.avatar_url);
            }
        } catch (err) {
            console.warn('Update failed', err.response?.data || err.message);
            let msg = 'Failed to save. Please try again.';

            if (err.response) {
                // Server responded with an error
                msg = err.response.data?.detail ||
                    err.response.data?.error ||
                    (typeof err.response.data === 'string' ? err.response.data : null) ||
                    msg;
            } else if (err.request) {
                // Request was made but no response received (Network Error)
                msg = 'Network Error: The server could not be reached. Please check your connection and ensure the file is not too large.';
            } else {
                msg = err.message || msg;
            }

            setAlertConfig({
                title: 'Error',
                message: msg,
                destructive: true
            });
            setAlertVisible(true);
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

    const initials = getInitials(profile?.first_name, profile?.last_name);

    return (
        <KeyboardAvoidingView
            style={s.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* ── Fixed top bar ── */}
            <View style={s.topBar}>
                <Pressable onPress={onBack} hitSlop={12}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={DARK} />
                </Pressable>
                <Text style={s.topBarTitle}>Account Settings</Text>
                <View style={{ width: 26 }} />
            </View>

            <Animated.ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
                style={{ opacity: fadeAnim }}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Avatar ── */}
                <View style={s.avatarSection}>
                    <Pressable style={s.avatarWrapper} onPress={handlePickPhoto}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={s.avatarImage} />
                        ) : profile?.avatar_url ? (
                            <Image
                                source={{
                                    uri: profile.avatar_url.startsWith('http')
                                        ? profile.avatar_url
                                        : `${MEDIA_BASE_URL}${profile.avatar_url}`
                                }}
                                style={s.avatarImage}
                            />
                        ) : (
                            <Text style={s.avatarInitials}>{initials}</Text>
                        )}
                        {/* Camera overlay */}
                        <View style={s.cameraOverlay}>
                            <MaterialCommunityIcons name="camera" size={16} color={DARK} />
                        </View>
                    </Pressable>
                    <Pressable onPress={handlePickPhoto} hitSlop={8}>
                        <Text style={s.editPhotoText}>EDIT PHOTO</Text>
                    </Pressable>
                </View>

                {/* ── Form Fields ── */}
                <View style={s.formSection}>
                    <FieldRow
                        label="FULL NAME"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Your full name"
                        s={s}
                        MUTED={MUTED}
                    />
                    <FieldRow
                        label="EMAIL ADDRESS"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholder="email@example.com"
                        s={s}
                        MUTED={MUTED}
                    />
                    {profile && !profile.is_verified && (
                        <View style={s.verifyContainer}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#FF9500" />
                            <Text style={s.unverifiedText}>Email not verified</Text>
                            <Pressable onPress={handleVerifyEmail} style={s.verifyBtn}>
                                <Text style={s.verifyBtnText}>Verify Now</Text>
                            </Pressable>
                        </View>
                    )}
                    <FieldRow
                        label="PHONE NUMBER"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder="+1 (555) 000-0000"
                        s={s}
                        MUTED={MUTED}
                    />
                </View>

                {/* ── Currency Selector ── */}
                <Text style={[s.fieldLabel, { marginTop: 12 }]}>BASE CURRENCY</Text>
                <Pressable
                    style={s.currencySelector}
                    onPress={() => setCurrencyModalVisible(true)}
                >
                    <View style={s.currencyMain}>
                        <Text style={s.currencyFlag}>{currency.flag}</Text>
                        <Text style={s.currencyText}>{currency.label} ({currency.symbol})</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={MUTED} />
                </Pressable>
                <View style={[s.fieldDivider, { marginTop: 4 }]} />

            </Animated.ScrollView>

            {/* Sticky Save Button below scroll, above BottomNav */}
            <View style={s.saveBtnWrapper}>
                <Pressable
                    style={[s.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color={colors.backgroundPrimary} />
                    ) : (
                        <Text style={s.saveBtnText}>Save</Text>
                    )}
                </Pressable>
            </View>

            {/* ── Currency Selection Modal ── */}
            <Modal visible={currencyModalVisible} animationType="slide" transparent={true} onRequestClose={() => setCurrencyModalVisible(false)}>
                <View style={s.modalOverlay}>
                    <View style={s.modalSheet}>
                        <Text style={s.modalTitle}>Select Currency</Text>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                            {CURRENCIES.map((c) => (
                                <Pressable
                                    key={c.code}
                                    style={s.currencyOption}
                                    onPress={() => { changeCurrency(c); setCurrencyModalVisible(false); }}
                                >
                                    <Text style={s.optionFlag}>{c.flag}</Text>
                                    <Text style={[s.optionText, currency.code === c.code && { fontWeight: 'bold', color: ACCENT }]}>
                                        {c.label} ({c.symbol})
                                    </Text>
                                    {currency.code === c.code && (
                                        <MaterialCommunityIcons name="check" size={20} color={ACCENT} />
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>
                        <Pressable style={s.closeModalBtn} onPress={() => setCurrencyModalVisible(false)}>
                            <Text style={s.closeModalText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>


            <BottomNav activeTab="profile" onTabChange={onNavigate} />
        </KeyboardAvoidingView>
    );
}

const getStyles = (colors, BG, CARD, DARK, ACCENT, MUTED, BORDER, insets) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },

    // Top bar
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 44,
        paddingHorizontal: 20, paddingBottom: 12,
        backgroundColor: BG,
    },
    topBarTitle: { fontSize: 18, fontWeight: '700', color: DARK },

    // Scroll
    scroll: { paddingHorizontal: 24, paddingBottom: 40 },

    // Avatar
    avatarSection: { alignItems: 'center', marginVertical: 24 },
    avatarWrapper: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: colors.progressTrack,
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 3, borderColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarInitials: { fontSize: 34, fontWeight: '800', color: DARK },
    cameraOverlay: {
        position: 'absolute', bottom: 0, right: 0,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: colors.backgroundPrimary,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: BORDER,
    },
    editPhotoText: {
        marginTop: 10, fontSize: 11, fontWeight: '700',
        color: ACCENT, letterSpacing: 1.2,
    },

    // Form
    formSection: { marginBottom: 12 },
    fieldBlock: { marginBottom: 4 },
    fieldLabel: { fontSize: 11, fontWeight: '600', color: MUTED, letterSpacing: 1, marginBottom: 6 },
    fieldInput: {
        fontSize: 16, fontWeight: '500', color: DARK,
        paddingVertical: 10, paddingHorizontal: 0,
        backgroundColor: 'transparent',
    },
    fieldInputDisabled: { color: MUTED },
    fieldDivider: { height: 1, backgroundColor: BORDER, marginBottom: 20 },

    // Currency Selector
    currencySelector: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 12,
    },
    currencyMain: { flexDirection: 'row', alignItems: 'center' },
    currencyFlag: { fontSize: 22, marginRight: 12 },
    currencyText: { fontSize: 16, fontWeight: '500', color: DARK },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: colors.backgroundCard,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: DARK, marginBottom: 20 },
    currencyOption: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16, borderBottomWidth: 1,
        borderBottomColor: colors.backgroundPrimary
    },
    optionFlag: { fontSize: 22, marginRight: 16 },
    optionText: { flex: 1, fontSize: 16, color: DARK },
    closeModalBtn: { marginTop: 12, paddingVertical: 16, alignItems: 'center' },
    closeModalText: { color: MUTED, fontSize: 16, fontWeight: 'bold' },

    // Save button
    saveBtnWrapper: {
        paddingHorizontal: 24, 
        paddingBottom: Math.max(insets.bottom + 80, 100), 
        paddingTop: 12,
        backgroundColor: BG,
    },
    saveBtn: {
        backgroundColor: DARK, borderRadius: 30,
        paddingVertical: 18, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    },
    saveBtnText: { color: colors.backgroundPrimary, fontSize: 16, fontWeight: '700' },

    // Verification
    verifyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -12,
        marginBottom: 16,
        paddingLeft: 4,
    },
    unverifiedText: {
        fontSize: 13,
        color: '#FF9500',
        marginLeft: 6,
        marginRight: 10,
        fontWeight: '500',
    },
    verifyBtn: {
        backgroundColor: colors.backgroundCard,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF9500',
    },
    verifyBtnText: {
        fontSize: 12,
        color: '#FF9500',
        fontWeight: '700',
    },
});
