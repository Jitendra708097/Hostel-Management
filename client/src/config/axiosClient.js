import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '';
const apiBaseURL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3000' : '/api');

// this is a function which creates an axios 
// instance with predefined configuration settings
//  such as base URL and headers.
const axiosClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials:true,
  headers: {
    'Content-Type': 'application/json',
  },
}
);

export default axiosClient;
