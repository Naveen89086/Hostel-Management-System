import api from './api';
import { ChatMessage, Request, ApiResponse } from '../types';

export const sendMessage = async (message: string): Promise<ApiResponse<{ userMessage: ChatMessage, aiMessage: ChatMessage, createdRequest?: Request }>> => {
  const response = await api.post('/chat/message', { message });
  return response.data;
};

export const getChatHistory = async (): Promise<ApiResponse<ChatMessage[]>> => {
  const response = await api.get<ApiResponse<ChatMessage[]>>('/chat/history');
  return response.data;
};
