import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types';
import { tokenStorage } from '../services/api';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User | null; token: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      
      // Store tokens
      tokenStorage.setTokens(action.payload.token, action.payload.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
      // Clear tokens
      tokenStorage.clearTokens();
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (state.refreshToken) {
        tokenStorage.setTokens(action.payload, state.refreshToken);
      }
    },
  },
});

export const { setLoading, loginSuccess, logout, updateUser, updateToken } = authSlice.actions;
export default authSlice.reducer;