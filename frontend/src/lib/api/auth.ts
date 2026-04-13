import api from './client';
import { LoginFormData, RegisterFormData } from '@/types/auth';

export async function login(credentials: LoginFormData) {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Backend responded with error (e.g., 400 or 401)
      return error.response.data;
    } else {
      // Network or unexpected error
      throw error;
    }
  }
}

export async function register(data: RegisterFormData) {
    const response = await api.post('/auth/register', data);
    return response.data;
}

export async function logout(){
    const response = await api.post('/auth/logout');
    return response.data;
}

export async function getCurrentUser(){
    const response = await api.get('/auth/me');
    return response.data;
}

export async function forgotPassword(email: string) {
  const response = await api.post('/auth/forgotPassword', { email });
  return response.data;
}

export async function resetPassword(token: string, password: string, passwordConfirm: string) {
  const response = await api.patch(`/auth/resetPassword/${token}`, {
    password,
    passwordConfirm,
  });
  return response.data;
}