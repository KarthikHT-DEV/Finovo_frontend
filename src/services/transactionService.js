import apiClient from './apiClient';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Fetch all available categories (Income/Expense).
 */
const getCategories = async () => {
    const response = await apiClient.get('/transactions/categories/');
    return response.data;
};

/**
 * Create a new transaction.
 * @param {Object} data { amount, description, category_id, date }
 */
const createTransaction = async (data) => {
    const response = await apiClient.post('/transactions/', data);
    return response.data;
};

const getBudgets = async () => {
    const response = await apiClient.get('/transactions/budgets/');
    return response.data;
};

const updateBudgets = async (budgets) => {
    const response = await apiClient.put('/transactions/budgets/', { budgets });
    return response.data;
};

/**
 * Update a transaction.
 * @param {number} id 
 * @param {Object} data 
 */
const updateTransaction = async (id, data) => {
    const response = await apiClient.put(`/transactions/${id}/`, data);
    return response.data;
};

/**
 * Delete a transaction.
 * @param {number} id 
 */
const deleteTransaction = async (id) => {
    const response = await apiClient.delete(`/transactions/${id}/`);
    return response.data;
};

/**
 * Fetch user's transactions (ordered by date desc).
 * @param {Object} filters { categoryId, startDate, endDate } — all optional
 */
const getTransactions = async (filters = {}) => {
    let url = '/transactions/';
    const params = [];
    if (filters.categoryId) {
        if (Array.isArray(filters.categoryId)) {
            if (filters.categoryId.length > 0) params.push(`category_id=${filters.categoryId.join(',')}`);
        } else {
            params.push(`category_id=${filters.categoryId}`);
        }
    }
    if (filters.paymentMethods) {
        if (Array.isArray(filters.paymentMethods)) {
            if (filters.paymentMethods.length > 0) params.push(`payment_method=${filters.paymentMethods.join(',')}`);
        } else {
            params.push(`payment_method=${filters.paymentMethods}`);
        }
    }
    if (filters.startDate) params.push(`start_date=${filters.startDate}`);
    if (filters.endDate) params.push(`end_date=${filters.endDate}`);

    if (params.length > 0) url += `?${params.join('&')}`;
    const response = await apiClient.get(url);
    return response.data;
};

const exportTransactions = async (format = 'csv') => {
    const token = apiClient.defaults.headers.common['Authorization'];
    const ext = format === 'xlsx' ? 'xlsx' : 'csv';

    // Ensure URL has exactly one slash between baseURL and path
    const cleanBase = apiClient.defaults.baseURL.replace(/\/+$/, '');
    const url = `${cleanBase}/transactions/download-export/?format=${format}`;

    let fileUri = `${FileSystem.documentDirectory}finovo_transactions_${Date.now()}.${ext}`;
    if (format === 'sample') {
        fileUri = `${FileSystem.documentDirectory}finovo_sample_template.csv`;
    }

    console.log('[V3-DEBUG] EXPORTING:', format);
    console.log('[V3-DEBUG] FULL URL:', url);
    console.log('[V3-DEBUG] TOKEN DEFINED:', !!token);

    const { uri, status } = await FileSystem.downloadAsync(
        url,
        fileUri,
        {
            headers: token ? { Authorization: token } : {}
        }
    );

    console.log('[V3-DEBUG] SERVER STATUS:', status);

    if (status !== 200) {
        throw new Error(`Export failed from server. Status: ${status}`);
    }
    return uri;
};

const importTransactions = async (fileObject) => {
    const formData = new FormData();
    formData.append('file', fileObject);
    // Let React Native/fetch handle the multipart boundary automatically
    const response = await apiClient.post('/transactions/import/', formData);
    return response.data;
};

/**
 * Clear all user transaction data.
 */
const cleanupData = async () => {
    const response = await apiClient.delete('/transactions/cleanup/');
    return response.data;
};

export default {
    getCategories,
    createTransaction,
    getBudgets,
    updateBudgets,
    updateTransaction,
    deleteTransaction,
    getTransactions,
    exportTransactions,
    importTransactions,
    cleanupData
};
