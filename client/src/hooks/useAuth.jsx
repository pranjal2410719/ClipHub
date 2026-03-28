import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { API_URL } from '../utils/api';

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now();

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ id, message, type });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
      toastTimerRef.current = null;
    }, 2600);
  };

  const authFetch = async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...options.headers
    };

    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (method === 'GET') {
      headers['Cache-Control'] = headers['Cache-Control'] || 'no-cache';
      headers.Pragma = headers.Pragma || 'no-cache';
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      cache: method === 'GET' ? 'no-store' : options.cache,
      headers
    });

    if (response.status === 401) {
      logout({ silent: true });
      throw new Error('Authentication failed');
    }

    return response;
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      showToast('Signed in successfully', 'success');

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password, name) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = ({ silent = false } = {}) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');

    if (!silent) {
      showToast('Signed out successfully', 'error');
    }
  };

  const updateUser = (patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : patch));
  };

  const getProfile = async () => {
    try {
      const response = await authFetch('/api/auth/profile');

      if (response.status === 304) {
        return { success: true, user };
      }

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
    }
  };

  useEffect(() => {
    if (token) {
      getProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    getProfile,
    authFetch,
    toast,
    setToast,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};