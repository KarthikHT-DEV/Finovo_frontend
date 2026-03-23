import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../styles/theme';

export default function PrivacyPolicyScreen({ onBack, onAccept, isAcceptanceMode = false }) {
    const { colors } = useTheme();
    const DARK = colors.textPrimary;
    const MUTED = colors.textSecondary;
    const BG = colors.backgroundPrimary;
    const CARD = colors.backgroundCard;

    const s = getStyles(colors, BG, DARK, MUTED, CARD, isAcceptanceMode);

    return (
        <View style={s.container}>
            {/* ── Header ── */}
            <View style={s.header}>
                {!isAcceptanceMode ? (
                    <Pressable onPress={onBack} hitSlop={12}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color={DARK} />
                    </Pressable>
                ) : <View style={{ width: 26 }} />}
                <Text style={s.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.mainTitle}>Our Commitment to Your Privacy</Text>

                <Text style={s.introText}>
                    At Finovo, we take your financial privacy seriously. This policy outlines how we handle
                    your data to help you budget better without compromising your security. Last updated:
                    October 24, 2023.
                </Text>

                <View style={s.section}>
                    <Text style={s.sectionTitle}>1. Data Collection</Text>
                    <Text style={s.sectionText}>
                        We collect only the necessary information to provide our budgeting services,
                        including transaction history you choose to sync and your account preferences.
                        We do not store your bank login credentials.
                    </Text>
                </View>

                <View style={s.section}>
                    <Text style={s.sectionTitle}>2. Information Usage</Text>
                    <Text style={s.sectionText}>
                        Finovo uses your data to generate personalized spending insights, monthly
                        reports, and automated budget suggestions. We do not sell your personal
                        data to third parties.
                    </Text>
                </View>

                {/* Highlight box / Quote */}
                <View style={s.quoteBox}>
                    <Text style={s.quoteText}>
                        "We prioritize clarity over complexity in our privacy standards."
                    </Text>
                </View>

                {/* Acceptance Button for new users */}
                {isAcceptanceMode && (
                    <Pressable style={s.acceptBtn} onPress={onAccept}>
                        <Text style={s.acceptBtnText}>Accept & Continue</Text>
                    </Pressable>
                )}
            </ScrollView>
        </View>
    );
}

const getStyles = (colors, BG, DARK, MUTED, CARD, isAcceptanceMode) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
    scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 },
    mainTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: DARK,
        lineHeight: 38,
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    introText: {
        fontSize: 16,
        color: MUTED,
        lineHeight: 24,
        marginBottom: 32
    },
    section: { marginBottom: 32 },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: DARK,
        marginBottom: 12
    },
    sectionText: {
        fontSize: 16,
        color: MUTED,
        lineHeight: 24
    },
    quoteBox: {
        backgroundColor: colors.backgroundCard,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.divider,
        marginBottom: 40,
    },
    quoteText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: DARK,
        textAlign: 'center',
        lineHeight: 24,
    },
    acceptBtn: {
        backgroundColor: colors.accent || '#C4A44A',
        paddingVertical: 18,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    acceptBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.white || '#FFF',
    }
});
