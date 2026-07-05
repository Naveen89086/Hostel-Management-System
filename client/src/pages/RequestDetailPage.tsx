import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Building2, CheckCircle2, XCircle, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import * as requestService from '../services/request.service';
import { Request } from '../types';
import { toast } from 'react-hot-toast';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [statusUpdate, setStatusUpdate] = useState('');
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (id) fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    try {
      setIsLoading(true);
      const res = await requestService.getRequestById(id!);
      if (res.success && res.data) {
        setRequest(res.data);
        setStatusUpdate(res.data.status);
        setResponseText(res.data.response || '');
      }
    } catch (error) {
      toast.error('Failed to load request details');
      navigate('/requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!id || !request) return;
    
    try {
      setIsUpdating(true);
      const res = await requestService.updateRequest(id, {
        status: statusUpdate,
        response: responseText
      });
      if (res.success) {
        toast.success('Request updated successfully');
        setRequest(res.data || null);
      }
    } catch (error) {
      toast.error('Failed to update request');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!request) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/requests')}
        className="flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Requests
      </button>

      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-surface-200 dark:border-surface-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{request.title}</h1>
            <div className="flex gap-2 shrink-0">
              <Badge variant={request.status === 'resolved' ? 'success' : request.status === 'in_progress' ? 'primary' : request.status === 'rejected' ? 'danger' : 'warning'} className="capitalize">
                {request.status.replace('_', ' ')}
              </Badge>
              <Badge variant={request.urgency === 'critical' ? 'danger' : request.urgency === 'high' ? 'warning' : 'info'} className="capitalize">
                {request.urgency} Priority
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-surface-600 dark:text-surface-400">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{(request.user as any)?.name || 'Unknown Student'}</span>
            </div>
            {request.roomNumber && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Room {request.roomNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(request.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wider mb-3">Description</h3>
            <p className="text-surface-800 dark:text-surface-200 whitespace-pre-wrap leading-relaxed bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-100 dark:border-surface-800">
              {request.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-100 dark:border-surface-800">
              <p className="text-sm font-medium text-surface-500 mb-1">Category</p>
              <p className="font-semibold text-surface-900 dark:text-white capitalize">{request.category || 'General'}</p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-100 dark:border-surface-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500 mb-1">Created Via</p>
                <p className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                  {request.aiParsed ? <><span className="text-primary-500">✨</span> AI Assistant</> : 'Manual Form'}
                </p>
              </div>
            </div>
          </div>

          {/* Response / Resolution */}
          {request.response && user?.role === 'student' && (
            <div className={`p-5 rounded-xl border ${request.status === 'resolved' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30' : request.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30' : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/30'}`}>
              <div className="flex items-center gap-2 mb-2 font-semibold">
                {request.status === 'resolved' ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" /> : 
                 request.status === 'rejected' ? <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" /> : 
                 <AlertCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
                <span className={request.status === 'resolved' ? 'text-green-800 dark:text-green-300' : request.status === 'rejected' ? 'text-red-800 dark:text-red-300' : 'text-primary-800 dark:text-primary-300'}>
                  Official Response
                </span>
              </div>
              <p className="text-surface-700 dark:text-surface-300 whitespace-pre-wrap">{request.response}</p>
            </div>
          )}

          {/* Admin Update Section */}
          {(user?.role === 'admin' || user?.role === 'warden') && (
            <div className="mt-8 border-t border-surface-200 dark:border-surface-700/50 pt-8">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Update Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Status</label>
                  <select 
                    value={statusUpdate} 
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="input-field max-w-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Response message (visible to student)</label>
                  <textarea 
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="input-field min-h-[100px] py-3"
                    placeholder="Provide details about the resolution or next steps..."
                  ></textarea>
                </div>
                <button 
                  onClick={handleUpdate} 
                  disabled={isUpdating || (statusUpdate === request.status && responseText === (request.response || ''))}
                  className="btn-primary"
                >
                  {isUpdating ? <Spinner size="sm" /> : <><Send className="h-4 w-4" /> Save Update</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
