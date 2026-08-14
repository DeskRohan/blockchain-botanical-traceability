import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RegisterDTO, LoginDTO } from '../types/index.js';
import { apiService } from '../services/api.js';
import { firebaseService } from '../services/firebaseService.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDTO) => Promise<void>;
  register: (dto: RegisterDTO) => Promise<void>;
  logout: () => void;
  setUserDirectly: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'farmsgo_user';
const STORAGE_KEY_TOKEN = 'farmsgo_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Error loading session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (dto: LoginDTO) => {
    setIsLoading(true);
    try {
      const res = await apiService.login(dto);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
      localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: RegisterDTO) => {
    setIsLoading(true);
    try {
      const res = await apiService.register(dto);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
      localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    firebaseService.logout().catch(console.error);
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  };

  const setUserDirectly = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUserDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
