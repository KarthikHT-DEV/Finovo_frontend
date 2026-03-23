import apiClient from './apiClient';

const getAnalytics = async (timeframe = 'month', categoryIds = [], startDate = null, endDate = null, year = null, paymentMethods = []) => {
    let url = `/transactions/analytics/?timeframe=${timeframe}`;
    
    if (categoryIds && categoryIds.length > 0) {
        url += `&category_id=${categoryIds.join(',')}`;
    }
    
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    if (year) url += `&year=${year}`;
    
    if (paymentMethods && paymentMethods.length > 0) {
        url += `&payment_method=${paymentMethods.join(',')}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
};

export default { getAnalytics };
