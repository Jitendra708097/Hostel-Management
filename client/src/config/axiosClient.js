import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_URL || '/api';

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
