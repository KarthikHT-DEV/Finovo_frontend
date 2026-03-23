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

    const handleExport = async (format) => {
        try {
            setIsLoading(true);
            setLoadingMessage('Generating file...');
            const data = await transactionService.exportTransactions(format);

            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result.split(',')[1];
                const filename = `finovo_transactions_${new Date().getTime()}.${format}`;
                const fileUri = FileSystem.documentDirectory + filename;

                await FileSystem.writeAsStringAsync(fileUri, base64, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri);
                } else {
                    Alert.alert('Success', `File saved to ${fileUri}`);
                }
                setIsLoading(false);
            };
            reader.readAsDataURL(data);

        } catch (err) {
            console.error('Export failed', err);
            Alert.alert('Error', 'Failed to export data. Please try again.');
            setIsLoading(false);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'text/comma-separated-values',
                    'text/csv',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ],
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setIsLoading(true);
            setLoadingMessage('Importing data...');

            const fileToUpload = {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || (file.name.endsWith('.csv') ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
            };

            const response = await transactionService.importTransactions(fileToUpload);
            Alert.alert('Success', response.message);
            setIsLoading(false);
        } catch (err) {
            console.error('Import failed', err);
            Alert.alert('Error', 'Failed to import data. Please check your file format and try again.');
            setIsLoading(false);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            "Clear All Data",
            "Are you sure you want to permanently delete all your transaction history? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await transactionService.cleanupData();
                            Alert.alert("Success", "All transaction data has been cleared.");
                        } catch (err) {
                            Alert.alert("Error", "Failed to clear data.");
                        }
                    }
                }
            ]
        );
    };

    const s = getStyles(colors);

    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <Pressable onPress={onBack} hitSlop={12}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={colors.textPrimary} />
                </Pressable>
                <Text style={s.headerTitle}>Data Management</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                {/* Export Options */}
                <Text style={s.sectionLabel}>EXPORT OPTIONS</Text>
                <View style={s.card}>
                    <DataRow
                        icon="file-export-outline"
                        title="Export as CSV"
                        subtitle="Best for simple spreadsheets"
                        btnLabel="CSV"
                        onPress={() => handleExport('csv')}
                        colors={colors}
                    />
                    <DataRow
                        icon="file-excel-outline"
                        title="Export as Excel"
                        subtitle="Best for detailed analysis"
                        btnLabel="XLS"
                        onPress={() => handleExport('xlsx')}
                        colors={colors}
                        isLast
                    />
                </View>

                {/* Import Options */}
                <Text style={s.sectionLabel}>IMPORT OPTIONS</Text>
                <View style={s.card}>
                    <DataRow
                        icon="file-import-outline"
                        title="Import Previous Data"
                        subtitle="Upload your CSV or XLSX file"
                        btnLabel="IMPORT"
                        onPress={handleImport}
                        colors={colors}
                        isLast
                        isImport
                    />
                </View>

                {/* Privacy */}
                <Text style={s.sectionLabel}>PRIVACY</Text>
                <View style={s.card}>
                    <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={handleClearData}>
                        <View style={[s.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.rowTitle, { color: '#EF4444' }]}>Clear All Data</Text>
                            <Text style={s.rowSubtitle}>Permanently delete your transaction history</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
                    </Pressable>
                </View>
            </ScrollView>

            {isLoading && (
                <View style={s.loaderOverlay}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={s.loaderText}>{loadingMessage}</Text>
                </View>
            )}

            <BottomNav activeTab="data" onTabChange={onNavigate} />
        </View>
    );
}

const DataRow = ({ icon, title, subtitle, btnLabel, onPress, colors, isLast, isImport }) => (
    <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
        <View style={[styles.iconCircle, { backgroundColor: isImport ? '#E0F2FE' : '#FEF3C7' }]}>
            <MaterialCommunityIcons name={icon} size={20} color={isImport ? '#0EA5E9' : '#DFA626'} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <Pressable
            style={[styles.actionBtn, isImport && { backgroundColor: '#0EA5E9' }]}
            onPress={onPress}
        >
            <Text style={styles.actionBtnText}>{btnLabel}</Text>
        </Pressable>
    </View>
);

const getStyles = (colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundPrimary },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 1.2,
        marginBottom: 12,
        marginTop: 8,
    },
    card: {
        backgroundColor: colors.backgroundCard,
        borderRadius: 24,
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
        borderRadius: 22,
        backgroundColor: colors.backgroundPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    rowTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
    rowSubtitle: { fontSize: 13, color: colors.textSecondary },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loaderText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: colors.textPrimary },
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
    rowTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    rowSubtitle: { fontSize: 13 },
    actionBtn: {
        backgroundColor: '#1A1C1E',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        minWidth: 70,
        alignItems: 'center'
    },
    actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
