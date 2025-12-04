import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '';

// this is a function which creates an axios 
// instance with predefined configuration settings
//  such as base URL and headers.
const axiosClient = axios.create({
  baseURL: isLocalhost ? 'http://localhost:3000' : "http://13.233.230.164:3000",
  withCredentials:true,
  headers: {
    'Content-Type': 'application/json',
  },
}
);

export default axiosClient;