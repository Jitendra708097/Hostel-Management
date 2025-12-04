import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axioClient from '../config/axiosClient';


// register user your self 
export const registerUser = createAsyncThunk(
  'auth/registerUser', 
  async (formData, {rejectWithValue}) => {
    try {
      const response = await axioClient.post('/user/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set the content type to multipart/form-data for file upload
        },
      });
      
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// login user on this platform 
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, {rejectWithValue}) => {
    try {
      const response = await axioClient.post('/user/login', credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// admin login on this platform 
export const adminLoginUser = createAsyncThunk(
  'auth/admin/loginUser',
  async (credentials, {rejectWithValue}) => {
    try {
      const response = await axioClient.post('/user/admin/login', credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// check authentication status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (__, {rejectWithValue}) => {
    try {
      const { data } = await axioClient.get('/user/check');
      return data.user;
    } catch (error) {
      if( error.response?.status === 401){
        return rejectWithValue(null);
      }
      return rejectWithValue(error);
    } 
  }
);

// logout user from this platform 
export const logout = createAsyncThunk(
  'auth/logout',
  async (__, {rejectWithValue}) => {
    try {
      await axioClient.post('/user/logout');
      return null;
    } catch (error) {
      return rejectWithValue
    }
  }
)
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder

      // Register user 
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload; // it can simple mark true if payload exist but this is more safe for when payload is null or undefined then it will be false
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // loginUser handle 
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // admin login handle 
      .addCase(adminLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(adminLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // checkAuthStatus handle
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      // logout handle
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export default authSlice.reducer;
