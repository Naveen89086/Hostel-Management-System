import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import * as requestService from '../services/request.service';
import { Request } from '../types';
import { toast } from 'react-hot-toast';

export const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  const tabs = [
    { id: '', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const params = activeTab ? { status: activeTab } : {};
      const res = await requestService.getRequests(params);
      if (res.success) {
        // @ts-ignore
        setRequests(res.data?.requests || res.data || []);
      }
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'in_progress': return 'primary';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Requests</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage and track hostel issues</p>
        </div>
        
        <button onClick={() => toast('New request form coming soon!')} className="btn-primary shrink-0 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar pb-2">
        <div className="flex space-x-2 bg-surface-100 dark:bg-surface-800/50 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-200/50 dark:hover:bg-surface-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : requests.length > 0 ? (
          <div className="divide-y divide-surface-200 dark:divide-surface-700/50 flex flex-col">
            {requests.map(req => (
              <div 
                key={req._id}
                onClick={() => navigate(`/requests/${req._id}`)}
                className="p-5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer group flex flex-col sm:flex-row gap-4"
              >
                <div className="p-3 bg-surface-100 dark:bg-surface-800 rounded-xl text-surface-500 group-hover:text-primary-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 shrink-0 self-start transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white truncate pr-4">
                      {req.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={getStatusBadge(req.status)} className="capitalize text-xs">
                        {req.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getUrgencyBadge(req.urgency)} className="capitalize text-xs">
                        {req.urgency}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-surface-600 dark:text-surface-400 text-sm line-clamp-2 mb-3">
                    {req.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-surface-500 dark:text-surface-500">
                    <span className="flex items-center gap-1 font-medium bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                      Type: <span className="capitalize text-surface-700 dark:text-surface-300">{req.type.replace('_', ' ')}</span>
                    </span>
                    {req.roomNumber && (
                      <span className="flex items-center gap-1 font-medium bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                        Room: <span className="text-surface-700 dark:text-surface-300">{req.roomNumber}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {req.aiParsed && (
                      <span className="flex items-center gap-1 text-primary-500 ml-auto">
                        ✨ AI Created
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-surface-500 flex flex-col items-center">
            <div className="bg-surface-100 dark:bg-surface-800 p-4 rounded-full mb-4">
              <FileText className="h-8 w-8 text-surface-400" />
            </div>
            <p className="text-lg font-medium text-surface-900 dark:text-white">No requests found</p>
            <p className="text-sm mt-1">Try changing your filters or create a new request.</p>
          </div>
        )}
      </div>
    </div>
  );
};
