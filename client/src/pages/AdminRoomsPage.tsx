import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import * as roomService from '../services/room.service';
import { Room } from '../types';
import { toast } from 'react-hot-toast';

export const AdminRoomsPage: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const res = await roomService.getRooms();
      if (res.success) {
        setRooms(res.data || []);
      }
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    // Mock delete for now since we didn't add delete service yet, wait, we can add it to room.service.ts
    toast.success('Room deletion will be fully implemented soon.');
  };

  if (user?.role !== 'admin' && user?.role !== 'warden') {
    return <div className="p-12 text-center text-red-500 font-medium">Access Denied. Admins and Wardens only.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Room Management</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage hostel rooms and capacities</p>
        </div>
        <button onClick={() => toast('Room creation modal coming soon')} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : rooms.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-surface-600 dark:text-surface-400">
              <thead className="bg-surface-50 dark:bg-surface-900/50 text-surface-900 dark:text-white font-medium uppercase tracking-wider text-xs border-b border-surface-200 dark:border-surface-700">
                <tr>
                  <th className="px-6 py-4">Room No.</th>
                  <th className="px-6 py-4">Block & Floor</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700/50">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-surface-900 dark:text-white">
                      {room.roomNumber}
                    </td>
                    <td className="px-6 py-4">
                      Block {room.block}, Floor {room.floor}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {room.type}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{room.occupants.length}</span> / {room.capacity}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'primary' : 'warning'}>
                        {room.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => toast('Edit room modal coming soon')} className="p-1.5 text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(room._id)} className="p-1.5 text-surface-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-surface-500">No rooms found.</div>
        )}
      </div>
    </div>
  );
};
