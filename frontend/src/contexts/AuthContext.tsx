import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: { name: string; email: string } | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await axios.post('http://localhost:3001/login', { username, password });
    if (response.data.token) {
      setToken(response.data.token);
      setUser({ name: response.data.name, email: response.data.email });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ name: response.data.name, email: response.data.email }));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const register = async (name: string, email: string, username: string, password: string) => {
    await axios.post('http://localhost:3001/users', { name, email, username, password });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
