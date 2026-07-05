import api from './api';
import { Room, ApiResponse } from '../types';

export const getRooms = async (params?: any): Promise<ApiResponse<Room[]>> => {
  const response = await api.get<ApiResponse<Room[]>>('/rooms', { params });
  return response.data;
};

export const getRoomById = async (id: string): Promise<ApiResponse<Room>> => {
  const response = await api.get<ApiResponse<Room>>(`/rooms/${id}`);
  return response.data;
};

export const requestAllocation = async (data: any): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/rooms/request-allocation', data);
  return response.data;
};

export const createRoom = async (data: any): Promise<ApiResponse<Room>> => {
  const response = await api.post<ApiResponse<Room>>('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: string, data: any): Promise<ApiResponse<Room>> => {
  const response = await api.patch<ApiResponse<Room>>(`/rooms/${id}`, data);
  return response.data;
};
