import React, { useState } from 'react';
import { X, Megaphone, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import * as requestService from '../services/request.service';

interface SOSEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSEmergencyModal: React.FC<SOSEmergencyModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTriggerEmergency = () => {
    setIsSubmitting(true);
    if (!navigator.geolocation) {
      toast.error('Unable to retrieve your current location.');
      setIsSubmitting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let locationStr = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;

        try {
          // Attempt to convert coordinates to a readable address using a free geocoding API
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const { amenity, building, neighbourhood, suburb, village, residential } = data.address;
              const parts = [];
              if (amenity) parts.push(amenity);
              if (building) parts.push(building);
              if (residential) parts.push(residential);
              if (neighbourhood) parts.push(neighbourhood);
              if (suburb && parts.length < 2) parts.push(suburb);
              if (village && parts.length < 2) parts.push(village);
              
              if (parts.length > 0) {
                locationStr = parts.join(', ');
              } else if (data.display_name) {
                // Extreme fallback if specific fields are missing but display_name exists
                locationStr = data.display_name.split(',').slice(0, 2).join(',');
              }
            }
          }
        } catch (err) {
          console.error('Reverse geocoding failed', err);
        }

        sendEmergencyAlert(locationStr);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsSubmitting(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location access denied. Please enable location permissions and try again.');
        } else {
          toast.error('Unable to retrieve your current location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const sendEmergencyAlert = async (locationInfo: string) => {
    try {
      const res = await requestService.createRequest({
        type: 'general',
        title: 'Emergency Alert',
        description: locationInfo,
        category: 'Emergency',
        urgency: 'critical',
      });

      if (res.success) {
        toast.success('Emergency Alert sent successfully!');
        onClose();
      } else {
        toast.error(res.message || 'Failed to send alert.');
      }
    } catch (error) {
      toast.error('An error occurred while sending the alert.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center justify-center w-full gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-bold">Emergency Alert</h2>
          </div>
          <button 
            onClick={onClose}
            className="absolute right-4 top-5 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-6">
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            This action will automatically track your GPS location and immediately notify Wardens and Administrators of an emergency. Please use this only in genuine emergencies!
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-left space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Transmitting Details:</h4>
            <p className="text-sm font-semibold text-slate-700">Name: <span className="font-bold text-slate-900 ml-1">{user?.name}</span></p>
            <p className="text-sm font-semibold text-slate-700">Room: <span className="font-bold text-slate-900 ml-1">{user?.roomNumber || 'N/A'}</span></p>
            <p className="text-sm font-semibold text-slate-700">Block: <span className="font-bold text-slate-900 ml-1">{user?.block || 'N/A'}</span></p>
          </div>


          <button
            onClick={handleTriggerEmergency}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#ef4444] hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <Megaphone className="h-4 w-4" />
            {isSubmitting ? 'TRIGGERING...' : 'TRIGGER EMERGENCY'}
          </button>
        </div>
      </div>
    </div>
  );
};
