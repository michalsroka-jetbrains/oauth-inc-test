import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export type BigQueryRow = { f?: { v?: unknown }[] };

const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

export const fetchBigQueryData = async (): Promise<BigQueryRow[]> => {
    const response = await api.get<BigQueryRow[]>('/api/bigquery/data');
    return response.data;
};

export const logout = async (): Promise<void> => {
    await api.post('/auth/logout');
};
