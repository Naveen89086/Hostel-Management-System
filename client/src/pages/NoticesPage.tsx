import React, { useState, useEffect } from 'react';
import { Bell, Plus, Pin, AlertTriangle, Info, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import * as noticeService from '../services/notice.service';
import { Notice } from '../types';
import { toast } from 'react-hot-toast';

export const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const res = await noticeService.getNotices();
      if (res.success) {
        setNotices(res.data || []);
      }
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'important': return <Pin className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'important': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Notice Board</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Important announcements and updates</p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'warden') && (
          <button onClick={() => toast('Notice creation form coming soon!')} className="btn-primary">
            <Plus className="h-4 w-4" /> Post Notice
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {notices.map(notice => (
            <div key={notice._id} className="glass-card overflow-hidden hover:border-primary-300 dark:hover:border-primary-700/50 transition-colors">
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
                <div className="shrink-0 pt-1">
                  <div className={`p-3 rounded-2xl ${
                    notice.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' : 
                    notice.priority === 'important' ? 'bg-amber-100 dark:bg-amber-900/30' : 
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {getPriorityIcon(notice.priority)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white pr-4">{notice.title}</h2>
                    <Badge variant={getPriorityBadge(notice.priority)} className="uppercase tracking-wider text-[10px]">
                      {notice.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed mb-4">
                    {notice.content}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-surface-100 dark:border-surface-800">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.tags?.map((tag, i) => (
                        <span key={i} className="text-xs font-medium text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 px-2.5 py-1 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-medium text-surface-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                          {(notice.author as any)?.name?.[0] || 'A'}
                        </span>
                        <span>{(notice.author as any)?.name || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-surface-500 flex flex-col items-center">
          <div className="bg-surface-100 dark:bg-surface-800 p-4 rounded-full mb-4">
            <Bell className="h-8 w-8 text-surface-400" />
          </div>
          <p className="text-lg font-medium text-surface-900 dark:text-white">No active notices</p>
          <p className="text-sm mt-1">Check back later for updates.</p>
        </div>
      )}
    </div>
  );
};
