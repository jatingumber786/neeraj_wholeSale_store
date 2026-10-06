import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wholesale_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify existing token on load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('wholesale_token');
      const savedUser = localStorage.getItem('wholesale_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Refresh from backend in background
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('wholesale_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, clearing local session.');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const saveSession = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('wholesale_token', authToken);
    localStorage.setItem('wholesale_user', JSON.stringify(userData));
  };

  const loginGoogle = async (googleData) => {
    const res = await authService.googleLogin(googleData);
    if (res.data.success) {
      saveSession(res.data.token, res.data.user);
    }
    return res.data;
  };

  const loginPhone = async (phoneData) => {
    const res = await authService.phoneLogin(phoneData);
    if (res.data.success) {
      saveSession(res.data.token, res.data.user);
    }
    return res.data;
  };

  const loginDealer = async (dealerData) => {
    const res = await authService.dealerLogin(dealerData);
    if (res.data.success) {
      saveSession(res.data.token, res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wholesale_token');
    localStorage.removeItem('wholesale_user');
  };

  const addAddress = async (addressData) => {
    const res = await authService.addAddress(addressData);
    if (res.data.success) {
      const updatedUser = { ...user, addresses: res.data.addresses };
      setUser(updatedUser);
      localStorage.setItem('wholesale_user', JSON.stringify(updatedUser));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isDealer: user?.role === 'dealer',
        loginGoogle,
        loginPhone,
        loginDealer,
        logout,
        addAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
