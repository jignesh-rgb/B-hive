import axios from 'axios';
import config from './config';

const apiClient = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
});


export const request = (endpoint: string, options: any = {}) => {
    return apiClient.request({
        url: endpoint,
        ...options,
    });
};

// Convenience methods
export const get = (endpoint: string, options?: any) =>
    apiClient.get(endpoint, options);

export const post = (endpoint: string, data?: any, options?: any) =>
    apiClient.post(endpoint, data, options);

export const put = (endpoint: string, data?: any, options?: any) =>
    apiClient.put(endpoint, data, options);

export const deleteRequest = (endpoint: string, options?: any) =>
    apiClient.delete(endpoint, options);

export default apiClient;
