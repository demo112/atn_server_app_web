import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const setToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const setUser = async (user: any) => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const user = await SecureStore.getItemAsync(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const removeUser = async () => {
  await SecureStore.deleteItemAsync(USER_KEY);
};

export const clearAuth = async () => {
  await Promise.all([removeToken(), removeUser()]);
};
