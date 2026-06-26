import React, { createContext, useState, useEffect, useContext } from 'react';
import { backendClient } from '../utils/backendClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    try {
      const data = await backendClient.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const registerUser = async (details) => {
    try {
      const data = await backendClient.post('/api/auth/register', details);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const updateUserProfile = async (formData) => {
    try {
      const data = await backendClient.put('/api/auth/profile', formData);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const addUserAddress = async (addressDetails) => {
    try {
      const data = await backendClient.post('/api/auth/address', addressDetails);
      const updatedUser = { ...user, addresses: data.addresses };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data.addresses;
    } catch (error) {
      throw error;
    }
  };

  const deleteUserAddress = async (addressId) => {
    try {
      const data = await backendClient.delete(`/api/auth/address/${addressId}`);
      const updatedUser = { ...user, addresses: data.addresses };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data.addresses;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      loginUser,
      registerUser,
      logoutUser,
      updateUserProfile,
      addUserAddress,
      deleteUserAddress,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'admin',
      isVendor: user?.role === 'vendor',
      isApprovedVendor: user?.role === 'vendor' && user?.isApproved,
      isCustomer: user?.role === 'customer'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
