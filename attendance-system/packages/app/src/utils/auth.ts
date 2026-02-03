import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const isWeb = Platform.OS === 'web';

export const setToken = async (token: string) => {
  if (isWeb) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

export const getToken = async () => {
  if (isWeb) {
    return localStorage.getItem(TOKEN_KEY);
  } else {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
};

export const removeToken = async () => {
  if (isWeb) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};

export const setUser = async (user: any) => {
  if (isWeb) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = async () => {
  if (isWeb) {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } else {
    const user = await SecureStore.getItemAsync(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
};

export const removeUser = async () => {
  if (isWeb) {
    localStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
};

export const clearAuth = async () => {
  await Promise.all([removeToken(), removeUser()]);
};

export const useAuth = () => {
  const [user, setUserState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then(u => {
      setUserState(u);
      setLoading(false);
    });
  }, []);

  return { user, loading };
};
