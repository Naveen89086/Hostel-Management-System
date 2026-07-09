import api from './api';
import { Request, ApiResponse, RequestStats } from '../types';

export const getRequests = async (params?: any): Promise<ApiResponse<Request[]>> => {
  const response = await api.get<ApiResponse<Request[]>>('/requests', { params });
  return response.data;
};

export const getRequestById = async (id: string): Promise<ApiResponse<Request>> => {
  const response = await api.get<ApiResponse<Request>>(`/requests/${id}`);
  return response.data;
};

export const createRequest = async (data: any): Promise<ApiResponse<Request>> => {
  const response = await api.post<ApiResponse<Request>>('/requests', data);
  return response.data;
};

export const updateRequest = async (id: string, data: any): Promise<ApiResponse<Request>> => {
  const response = await api.patch<ApiResponse<Request>>(`/requests/${id}`, data);
  return response.data;
};

export const getRequestStats = async (): Promise<ApiResponse<RequestStats>> => {
  const response = await api.get<ApiResponse<RequestStats>>('/requests/stats');
  return response.data;
};

export const deleteRequest = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete<ApiResponse<null>>(`/requests/${id}`);
  return response.data;
};
