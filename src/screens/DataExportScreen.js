import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../styles/theme';
import transactionService from '../services/transactionService';
import BottomNav from '../components/BottomNav';

export default function DataExportScreen({ onBack, onNavigate }) {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // ──────────────────────────────────────────────────────────────────────
    // EXPORT
    // ──────────────────────────────────────────────────────────────────────
    const handleExport = async (format) => {
        try {
            setIsLoading(true);
            setLoadingMessage(`Generating ${format.toUpperCase()} file…`);

            // service returns a saved file URI
            const fileUri = await transactionService.exportTransactions(format);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: format === 'xlsx'
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : 'text/csv',
                    dialogTitle: 'Share your Finovo transactions',
                });
            } else {
                Alert.alert('Saved', `File saved to:\n${fileUri}`);
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Export failed', err);
            Alert.alert('Export Failed', 'Failed to export data. Please try again.');
            setIsLoading(false);
        }
    };

    // ──────────────────────────────────────────────────────────────────────
    // SAMPLE TEMPLATE
    // ──────────────────────────────────────────────────────────────────────
    const handleDownloadSample = async () => {
        try {
            setIsLoading(true);
            setLoadingMessage('Downloading sample template…');

            const fileUri = await transactionService.exportTransactions('sample');

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
            } else {
                Alert.alert('Saved', `Sample saved to:\n${fileUri}`);
            }
            setIsLoading(false);
        } catch (err) {
            Alert.alert('Error', 'Failed to download sample template.');
            setIsLoading(false);
        }
    };

    // ──────────────────────────────────────────────────────────────────────
    // IMPORT
    // ──────────────────────────────────────────────────────────────────────
    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'text/comma-separated-values',
                    'text/csv',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/octet-stream',
                ],
            });

            if (result.canceled) return;

            const file = result.assets[0];

            // 5 MB client-side guard
            if (file.size && file.size > 5 * 1024 * 1024) {
                Alert.alert('File Too Large', 'Maximum allowed file size is 5 MB.');
                return;
            }

            setIsLoading(true);
            setLoadingMessage('Importing transactions…');

            const fileToUpload = {
                uri: file.uri,
                name: file.name,
                type: file.mimeType
                    || (file.name.endsWith('.csv') ? 'text/csv'
                        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
            };

            const response = await transactionService.importTransactions(fileToUpload);

            const { success_count = 0, failed_count = 0, failed_rows = [] } = response;
            let summary = `✅ ${success_count} transactions imported.`;
            if (failed_count > 0) {
                summary += `\n⚠️ ${failed_count} rows skipped.`;
                // Show details of first 5 failures
                const details = failed_rows.slice(0, 5)
                    .map(r => `  Row ${r.row}: ${r.reason}`)
                    .join('\n');
                summary += `\n\nFirst ${Math.min(failed_count, 5)} errors:\n${details}`;
            }
            Alert.alert('Import Complete', summary);
            setIsLoading(false);

        } catch (err) {
            console.error('Import failed', err);
            const msg = err?.response?.data?.error || 'Failed to import data. Check your file format and try again.';
            Alert.alert('Import Failed', msg);
            setIsLoading(false);
        }
    };

    // ──────────────────────────────────────────────────────────────────────
    // CLEAR DATA
    // ──────────────────────────────────────────────────────────────────────
    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to permanently delete all your transaction history? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            setLoadingMessage('Clearing data…');
                            await transactionService.cleanupData();
                            Alert.alert('Done', 'All transaction data has been cleared.');
                        } catch {
                            Alert.alert('Error', 'Failed to clear data.');
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const s = getStyles(colors);

    return (
        <View style={s.container}>
            {/* ── Header ── */}
            <View style={s.header}>
                <Pressable onPress={onBack} hitSlop={12}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={colors.textPrimary} />
                </Pressable>
                <Text style={s.headerTitle}>Data Management</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                {/* ── Export ── */}
                <Text style={s.sectionLabel}>EXPORT OPTIONS</Text>
                <View style={s.card}>
                    <DataRow
                        icon="file-export-outline"
                        title="Export as CSV"
                        subtitle="Simple spreadsheet — open in any app"
                        btnLabel="CSV"
                        onPress={() => handleExport('csv')}
                        colors={colors}
                        iconBg="#FEF3C7"
                        iconColor="#DFA626"
                    />
                    <DataRow
                        icon="file-excel-outline"
                        title="Export as Excel"
                        subtitle="Formatted workbook with styled headers"
                        btnLabel="XLSX"
                        onPress={() => handleExport('xlsx')}
                        colors={colors}
                        iconBg="#DCFCE7"
                        iconColor="#16A34A"
                        isLast
                    />
                </View>

                {/* ── Import ── */}
                <Text style={s.sectionLabel}>IMPORT OPTIONS</Text>
                <View style={s.card}>
                    <DataRow
                        icon="file-import-outline"
                        title="Import Transactions"
                        subtitle="Upload your CSV or XLSX file"
                        btnLabel="IMPORT"
                        onPress={handleImport}
                        colors={colors}
                        iconBg="#E0F2FE"
                        iconColor="#0EA5E9"
                    />
                    <DataRow
                        icon="file-download-outline"
                        title="Download Sample Template"
                        subtitle="Get a pre-filled CSV template to guide you"
                        btnLabel="SAMPLE"
                        onPress={handleDownloadSample}
                        colors={colors}
                        iconBg="#EDE9FE"
                        iconColor="#7C3AED"
                        isLast
                    />
                </View>

                {/* ── Format Guide ── */}
                <Text style={s.sectionLabel}>IMPORT FORMAT GUIDE</Text>
                <View style={[s.card, { padding: 16 }]}>
                    <Text style={[s.guideText, { color: colors.textSecondary }]}>
                        Your file must include these columns (case-insensitive):
                    </Text>
                    {['Date (YYYY-MM-DD)', 'Description', 'Category', 'Type (INCOME or EXPENSE)', 'Amount', 'Payment Method'].map((col, i) => (
                        <View key={i} style={s.guideRow}>
                            <MaterialCommunityIcons name="check-circle" size={14} color={colors.accent} />
                            <Text style={[s.guideCol, { color: colors.textPrimary }]}>{col}</Text>
                        </View>
                    ))}
                    <Text style={[s.guideNote, { color: colors.textSecondary }]}>
                        Max file size: 5 MB. Unsupported categories will be created automatically.
                    </Text>
                </View>

                {/* ── Privacy ── */}
                <Text style={s.sectionLabel}>PRIVACY</Text>
                <View style={s.card}>
                    <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={handleClearData}>
                        <View style={[s.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.rowTitle, { color: '#EF4444' }]}>Clear All Data</Text>
                            <Text style={[s.rowSubtitle, { color: colors.textSecondary }]}>Permanently delete your transaction history</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                    </Pressable>
                </View>
            </ScrollView>

            {isLoading && (
                <View style={s.loaderOverlay}>
                    <View style={s.loaderCard}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={[s.loaderText, { color: colors.textPrimary }]}>{loadingMessage}</Text>
                    </View>
                </View>
            )}

            <BottomNav activeTab="data" onTabChange={onNavigate} />
        </View>
    );
}

// ─── DataRow Component ─────────────────────────────────────────────────────
const DataRow = ({ icon, title, subtitle, btnLabel, onPress, colors, iconBg, iconColor, isLast }) => (
    <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg || '#F1F5F9' }]}>
            <MaterialCommunityIcons name={icon} size={20} color={iconColor || '#94A3B8'} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <Pressable style={styles.actionBtn} onPress={onPress}>
            <Text style={styles.actionBtnText}>{btnLabel}</Text>
        </Pressable>
    </View>
);

// ─── Styles ────────────────────────────────────────────────────────────────
const getStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundPrimary },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 1.2,
        marginBottom: 10,
        marginTop: 8,
    },
    card: {
        backgroundColor: colors.backgroundCard,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.backgroundPrimary,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    rowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    rowSubtitle: { fontSize: 12 },
    guideText: { fontSize: 13, marginBottom: 8, lineHeight: 20 },
    guideRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    guideCol: { fontSize: 13, fontWeight: '500' },
    guideNote: { fontSize: 12, marginTop: 10, lineHeight: 18, fontStyle: 'italic' },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loaderCard: {
        backgroundColor: colors.backgroundCard,
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        gap: 14,
        width: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
    },
    loaderText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
});

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    rowTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    rowSubtitle: { fontSize: 12 },
    actionBtn: {
        backgroundColor: '#1A1C1E',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        minWidth: 68,
        alignItems: 'center',
    },
    actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
