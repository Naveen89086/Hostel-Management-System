import api from './api';
import { User, ApiResponse } from '../types';

export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/users/profile');
  return response.data;
};

export const updateProfile = async (data: any): Promise<ApiResponse<User>> => {
  const response = await api.patch<ApiResponse<User>>('/users/profile', data);
  return response.data;
};

export const getAllUsers = async (params?: any): Promise<ApiResponse<User[]>> => {
  const response = await api.get<ApiResponse<User[]>>('/users', { params });
  return response.data;
};

export const updateUserStatus = async (id: string, isActive: boolean): Promise<ApiResponse<User>> => {
  const response = await api.patch<ApiResponse<User>>(`/users/${id}/status`, { isActive });
  return response.data;
};

export const updateUserRole = async (id: string, role: string): Promise<ApiResponse<User>> => {
  const response = await api.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
  return response.data;
};
