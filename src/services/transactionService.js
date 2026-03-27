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
    if (filters.isFavorite !== undefined) params.push(`is_favorite=${filters.isFavorite}`);

    if (params.length > 0) url += `?${params.join('&')}`;
    const response = await apiClient.get(url);
    return response.data;
};

const markFavorite = async (id) => {
    const response = await apiClient.post(`/transactions/${id}/favorite/`);
    return response.data;
};

const unmarkFavorite = async (id) => {
    const response = await apiClient.post(`/transactions/${id}/unfavorite/`);
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
    markFavorite,
    unmarkFavorite
};
