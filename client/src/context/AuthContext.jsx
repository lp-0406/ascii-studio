import React, {
  createContext, useState, useEffect, useCallback, useMemo,
} from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'ascii_studio_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const loginUser = useCallback(async (credentials) => {
    const { user: loggedInUser, token } = await authService.login(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const registerUser = useCallback(async (payload) => {
    const { user: newUser, token } = await authService.register(payload);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(newUser);
    return newUser;
  }, []);

  const logoutUser = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    authService.logout().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      user, loading, loginUser, registerUser, logoutUser, isAuthenticated: Boolean(user),
    }),
    [user, loading, loginUser, registerUser, logoutUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
