import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PortfolioData,
  SiteSettings,
  Category,
  Artwork,
  Exhibition,
  AboutContent,
  CVDoc,
  SocialLink,
} from '../types.js';
import { api, getStoredToken, getStoredUsername, clearStoredToken } from '../api/client.js';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface PortfolioContextType {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  reloadData: () => Promise<void>;
  // Auth state
  isAdmin: boolean;
  adminUser: string | null;
  setAdminUser: (user: string | null) => void;
  loginAdmin: (token: string, username: string) => void;
  logoutAdmin: () => Promise<void>;
  // Navigation & Cover State
  currentPath: string;
  navigate: (path: string) => void;
  hasEntered: boolean;
  setHasEntered: (val: boolean) => void;
  enterPortfolio: () => void;
  // Year & Category Filters for Archive
  selectedYear: string | null;
  setSelectedYear: (year: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  clearFilters: () => void;
  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  const [selectedYear, setSelectedYearState] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategoryState] = useState<string | null>(null);

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [hasEntered, setHasEntered] = useState<boolean>(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const enterPortfolio = useCallback(() => {
    setHasEntered(true);
    setSelectedYearState(null);
    setSelectedCategoryState(null);
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setCurrentPath('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getPublicData();
      // If admin token is present, try loading inquiries/messages as well
      const token = getStoredToken();
      if (token) {
        try {
          const msgs = await api.getMessages();
          res.inquiries = msgs;
          res.messages = msgs;
        } catch {
          // ignore if unauthorized
        }
      }
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch public portfolio data:', err);
      setError(err.message || 'Failed to load portfolio content');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth session
  const verifyAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setIsAdmin(false);
      setAdminUser(null);
      return;
    }
    try {
      const me = await api.getMe();
      if (me.authenticated) {
        setIsAdmin(true);
        setAdminUser(me.username);
      } else {
        clearStoredToken();
        setIsAdmin(false);
        setAdminUser(null);
      }
    } catch {
      const storedToken = getStoredToken();
      const storedUser = getStoredUsername();
      if (storedToken && storedUser) {
        setIsAdmin(true);
        setAdminUser(storedUser);
      } else {
        clearStoredToken();
        setIsAdmin(false);
        setAdminUser(null);
      }
    }
  }, []);

  const loginAdmin = useCallback((_token: string, username: string) => {
    setIsAdmin(true);
    setAdminUser(username);
    showToast(`Welcome back, ${username}`, 'success');
  }, [showToast]);

  const logoutAdmin = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      clearStoredToken();
      setIsAdmin(false);
      setAdminUser(null);
      setHasEntered(true);
      showToast('Logged out successfully. Returned to website.', 'info');
      navigate('/');
    }
  }, [navigate, showToast]);

  const setSelectedYear = useCallback((year: string | null) => {
    setSelectedYearState(year);
    if (year !== null && window.location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate]);

  const setSelectedCategory = useCallback((cat: string | null) => {
    setSelectedCategoryState(cat);
    if (cat !== null && window.location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate]);

  const clearFilters = useCallback(() => {
    setSelectedYearState(null);
    setSelectedCategoryState(null);
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    refreshData();
    verifyAuth();
  }, [refreshData, verifyAuth]);

  return (
    <PortfolioContext.Provider
      value={{
        data,
        loading,
        error,
        refreshData,
        reloadData: refreshData,
        isAdmin,
        adminUser,
        setAdminUser,
        loginAdmin,
        logoutAdmin,
        currentPath,
        navigate,
        hasEntered,
        setHasEntered,
        enterPortfolio,
        selectedYear,
        setSelectedYear,
        selectedCategory,
        setSelectedCategory,
        clearFilters,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
