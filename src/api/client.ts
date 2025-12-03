import axios from 'axios';

// Create an Axios instance with default configuration
const client = axios.create({
    baseURL: '/api', // Base URL for all requests, assumes API is served from the same origin or proxied
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a response interceptor to handle errors globally if needed
client.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors here (e.g., logging, redirecting on 401)
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default client;
