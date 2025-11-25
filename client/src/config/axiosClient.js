import axios from 'axios';


// this is a function which creates an axios 
// instance with predefined configuration settings
//  such as base URL and headers.
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials:true,
  headers: {
    'Content-Type': 'application/json',
  },
}
);

export default axiosClient;