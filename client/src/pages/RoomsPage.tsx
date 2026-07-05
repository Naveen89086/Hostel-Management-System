import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import * as roomService from '../services/room.service';
import { Room } from '../types';
import { toast } from 'react-hot-toast';

export const RoomsPage: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [blockFilter, setBlockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  useEffect(() => {
    fetchRooms();
  }, [blockFilter, statusFilter]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (blockFilter) params.block = blockFilter;
      if (statusFilter) params.status = statusFilter;
      
      const res = await roomService.getRooms(params);
      if (res.success) {
        setRooms(res.data || []);
      }
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const openRoomDetail = async (id: string) => {
    try {
      const res = await roomService.getRoomById(id);
      if (res.success && res.data) {
        setSelectedRoom(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      toast.error('Failed to load room details');
    }
  };

  const handleRequestAllocation = async () => {
    if (!selectedRoom) return;
    try {
      await roomService.requestAllocation({ roomNumber: selectedRoom.roomNumber, preferences: 'Requested specific room' });
      toast.success('Room allocation request submitted');
      setIsDetailModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Rooms</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Browse and manage hostel rooms</p>
        </div>
        
        {user?.role === 'admin' && (
          <button className="btn-primary">
            <Plus className="h-4 w-4" /> Add Room
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-surface-500">
          <Search className="h-5 w-5" />
          <span className="font-medium text-sm">Filters:</span>
        </div>
        
        <select 
          className="input-field py-1.5 px-3 max-w-[150px] text-sm"
          value={blockFilter}
          onChange={(e) => setBlockFilter(e.target.value)}
        >
          <option value="">All Blocks</option>
          <option value="A">Block A</option>
          <option value="B">Block B</option>
        </select>

        <select 
          className="input-field py-1.5 px-3 max-w-[150px] text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Room Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {rooms.map(room => (
            <div key={room._id} className="glass-card overflow-hidden flex flex-col hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              <div className="p-5 border-b border-surface-200 dark:border-surface-700/50 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white">{room.roomNumber}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Block {room.block} • Floor {room.floor}</p>
                </div>
                <Badge variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'primary' : 'warning'} className="capitalize text-[10px]">
                  {room.status}
                </Badge>
              </div>
              
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Type</span>
                  <span className="font-medium capitalize text-surface-900 dark:text-white">{room.type}</span>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-surface-500">Occupancy</span>
                    <span className="font-medium text-surface-900 dark:text-white">{room.occupants.length} / {room.capacity}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${room.occupants.length === room.capacity ? 'bg-red-500' : 'bg-primary-500'}`}
                      style={{ width: `${(room.occupants.length / room.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-auto pt-4">
                  {room.amenities.slice(0, 3).map((amenity, i) => (
                    <span key={i} className="px-2 py-1 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded text-xs">
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded text-xs">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => openRoomDetail(room._id)}
                className="w-full py-3 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800 text-sm font-medium text-primary-600 dark:text-primary-400 transition-colors border-t border-surface-200 dark:border-surface-700/50"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-surface-500">
          No rooms found matching your filters.
        </div>
      )}

      {/* Room Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Room ${selectedRoom?.roomNumber}`}>
        {selectedRoom && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-surface-500">Block {selectedRoom.block}, Floor {selectedRoom.floor}</p>
                <p className="font-medium capitalize mt-1">{selectedRoom.type} Room</p>
              </div>
              <Badge variant={selectedRoom.status === 'available' ? 'success' : selectedRoom.status === 'occupied' ? 'primary' : 'warning'} className="capitalize px-3 py-1 text-sm">
                {selectedRoom.status}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold text-surface-900 dark:text-white mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.amenities.map((amenity, i) => (
                  <Badge key={i} variant="default">{amenity}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4" /> Occupants ({selectedRoom.occupants.length}/{selectedRoom.capacity})
                </h4>
              </div>
              
              {selectedRoom.occupants.length > 0 ? (
                <div className="space-y-2">
                  {selectedRoom.occupants.map((occ: any, i: number) => (
                    <div key={i} className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg flex items-center gap-3 border border-surface-200 dark:border-surface-700">
                      <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {occ.name ? occ.name[0] : 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-surface-900 dark:text-white">{occ.name || 'Unknown Student'}</p>
                        {occ.email && <p className="text-xs text-surface-500">{occ.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-500 italic">This room is currently empty.</p>
              )}
            </div>

            {user?.role === 'student' && selectedRoom.status === 'available' && (
              <button 
                onClick={handleRequestAllocation}
                className="btn-primary w-full mt-4"
              >
                Request Allocation
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
