import api from './api';
import { ApiResponse } from '../types';

export interface ISettings {
  hostelName: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  autoApproveLeaves: boolean;
}

export const getSettings = async (): Promise<ApiResponse<ISettings>> => {
  const response = await api.get<ApiResponse<ISettings>>('/settings');
  return response.data;
};

export const updateSettings = async (data: Partial<ISettings>): Promise<ApiResponse<ISettings>> => {
  const response = await api.put<ApiResponse<ISettings>>('/settings', data);
  return response.data;
};
