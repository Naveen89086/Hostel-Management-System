import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, DoorOpen, Clock, Bell, Users, MessageSquareText, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import * as requestService from '../services/request.service';
import * as noticeService from '../services/notice.service';
import * as roomService from '../services/room.service';
import * as userService from '../services/user.service';
import { DashboardStats, Request, Notice } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch available rooms, requests, notices, and students
      const [requestsRes, noticesRes, roomsRes, studentsRes] = await Promise.all([
        requestService.getRequests({ limit: 5 }),
        noticeService.getNotices({ limit: 3 }),
        roomService.getRooms(),
        userService.getAllUsers({ role: 'student' })
      ]);
      
      if (requestsRes.success) setRecentRequests(requestsRes.data || []);
      if (noticesRes.success) setRecentNotices(noticesRes.data || []);
      
      const rooms = roomsRes.data || [];
      // @ts-ignore
      const students = studentsRes.data?.users || studentsRes.data || [];
      
      setStats({
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.status === 'available').length,
        occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
        maintenanceRooms: rooms.filter(r => r.status === 'maintenance').length,
        totalRequests: (requestsRes.data as any)?.pagination?.total || (requestsRes as any)?.count || 0,
        // @ts-ignore
        pendingRequests: ((requestsRes.data?.requests) || requestsRes.data || []).filter((r: any) => r.status === 'pending').length,
        totalStudents: students.length,
        totalNotices: noticesRes.count || 0
      });

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleEvent = () => fetchDashboardData();
    socket.on('request:created', handleEvent);
    socket.on('request:updated', handleEvent);
    return () => {
      socket.off('request:created', handleEvent);
      socket.off('request:updated', handleEvent);
    };
  }, [socket]);

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

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Here's what's happening in your hostel today.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/chat')} className="btn-primary">
            <MessageSquareText className="h-4 w-4" /> AI Assistant
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Rooms" 
          value={stats?.totalRooms || 0} 
          icon={Building2} 
          colorClass="text-blue-500 bg-blue-500" 
        />
        <StatCard 
          title="Available Rooms" 
          value={stats?.availableRooms || 0} 
          icon={DoorOpen} 
          colorClass="text-green-500 bg-green-500" 
          trend="2 new" trendUp 
        />
        <StatCard 
          title="Pending Requests" 
          value={stats?.pendingRequests || 0} 
          icon={Clock} 
          colorClass="text-amber-500 bg-amber-500" 
        />
        {user?.role !== 'student' ? (
          <StatCard 
            title="Total Students" 
            value={stats?.totalStudents || 0} 
            icon={Users} 
            colorClass="text-purple-500 bg-purple-500" 
          />
        ) : (
          <StatCard 
            title="Active Notices" 
            value={stats?.totalNotices || 0} 
            icon={Bell} 
            colorClass="text-purple-500 bg-purple-500" 
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">Recent Requests</h2>
            <button onClick={() => navigate('/requests')} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="glass-card overflow-hidden">
            {recentRequests.length > 0 ? (
              <div className="divide-y divide-surface-200 dark:divide-surface-700/50">
                {recentRequests.map(req => (
                  <div key={req._id} onClick={() => navigate(`/requests/${req._id}`)} className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{req.title}</h3>
                        <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2 mt-1">
                          {new Date(req.createdAt).toLocaleDateString()}
                          {req.roomNumber && <span className="inline-block w-1 h-1 rounded-full bg-surface-300"></span>}
                          {req.roomNumber && <span>Room {req.roomNumber}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <Badge variant={getStatusBadge(req.status)} className="capitalize">{req.status.replace('_', ' ')}</Badge>
                      <Badge variant={getUrgencyBadge(req.urgency)} className="capitalize text-[10px]">{req.urgency}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-surface-500">
                No recent requests found.
              </div>
            )}
          </div>
        </div>

        {/* Notices & Quick Actions */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Notice Board</h2>
              <button onClick={() => navigate('/notices')} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                View all
              </button>
            </div>
            
            <div className="space-y-3">
              {recentNotices.length > 0 ? (
                recentNotices.map(notice => (
                  <div key={notice._id} className="glass-card p-4 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer" onClick={() => navigate('/notices')}>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={notice.priority === 'urgent' ? 'danger' : notice.priority === 'important' ? 'warning' : 'primary'} className="text-[10px] uppercase">
                        {notice.priority}
                      </Badge>
                      <span className="text-xs text-surface-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold text-surface-900 dark:text-white text-sm line-clamp-1">{notice.title}</h3>
                  </div>
                ))
              ) : (
                <div className="glass-card p-6 text-center text-sm text-surface-500">
                  No active notices.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/requests')} className="glass-card p-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors group">
                <FileText className="h-6 w-6 text-primary-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">New Request</span>
              </button>
              <button onClick={() => navigate('/rooms')} className="glass-card p-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors group">
                <Building2 className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">View Rooms</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
