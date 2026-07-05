import api from './api';
import { Notice, ApiResponse } from '../types';

export const getNotices = async (params?: any): Promise<ApiResponse<Notice[]>> => {
  const response = await api.get<ApiResponse<Notice[]>>('/notices', { params });
  return response.data;
};

export const createNotice = async (data: any): Promise<ApiResponse<Notice>> => {
  const response = await api.post<ApiResponse<Notice>>('/notices', data);
  return response.data;
};

export const updateNotice = async (id: string, data: any): Promise<ApiResponse<Notice>> => {
  const response = await api.patch<ApiResponse<Notice>>(`/notices/${id}`, data);
  return response.data;
};

export const deleteNotice = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(`/notices/${id}`);
  return response.data;
};
