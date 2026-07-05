import React, { useState } from 'react';
import { X, Megaphone, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as requestService from '../services/request.service';

interface SOSEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSEmergencyModal: React.FC<SOSEmergencyModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTriggerEmergency = async () => {
    try {
      setIsSubmitting(true);
      
      // In a real app we might try to fetch geolocation here
      const locationInfo = 'Lat: 17.7239, Lng: 78.2562'; 

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
