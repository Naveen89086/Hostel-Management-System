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
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:px-6 sm:py-4 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Requests</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage and track hostel issues</p>
          </div>
          
          <button onClick={() => toast('New request form coming soon!')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 w-full sm:w-auto">
            <Plus className="h-4 w-4" /> New Request
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto custom-scrollbar pb-2">
          <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Request List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" className="text-blue-500" /></div>
          ) : requests.length > 0 ? (
            <div className="divide-y divide-slate-100 flex flex-col">
              {requests.map(req => (
                <div 
                  key={req._id}
                  onClick={() => navigate(`/requests/${req._id}`)}
                  className="p-5 sm:px-8 hover:bg-slate-50/50 transition-colors cursor-pointer group flex flex-col sm:flex-row gap-5"
                >
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 shrink-0 self-start transition-colors border border-slate-100">
                    <FileText className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-800 truncate pr-4">
                        {req.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={getStatusBadge(req.status)} className="capitalize text-xs font-bold">
                          {req.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getUrgencyBadge(req.urgency)} className="capitalize text-xs font-bold">
                          {req.urgency}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                      {req.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        Type: <span className="capitalize text-slate-700">{req.type.replace('_', ' ')}</span>
                      </span>
                      {req.roomNumber && (
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          Room: <span className="text-slate-700">{req.roomNumber}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {req.aiParsed && (
                        <span className="flex items-center gap-1 text-amber-500 ml-auto font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100">
                          ✨ AI Created
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-600">No requests found</p>
              <p className="text-sm mt-1 font-medium">Try changing your filters or create a new request.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
