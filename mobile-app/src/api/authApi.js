import axios from 'axios';

const API_URL = 'http://192.168.0.101:3000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000,
})

export const register = (firstName, lastName, email, password) => axiosInstance.post('/auth/register', { firstName, lastName, email, password });
export const login = (email, password) => axiosInstance.post('/auth/login', { email, password });