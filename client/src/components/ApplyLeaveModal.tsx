import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import * as requestService from '../services/request.service';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await requestService.createRequest({
        type: 'general',
        title: 'Leave Request',
        description: `${startDate}|${endDate}|${reason}`,
        category: 'Leave',
        urgency: 'low',
      });

      if (res.success) {
        toast.success('Leave applied successfully!');
        setStartDate('');
        setEndDate('');
        setReason('');
        onClose();
      } else {
        toast.error(res.message || 'Failed to apply leave.');
      }
    } catch (error) {
      toast.error('An error occurred while submitting.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Apply Leave</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Student Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  readOnly
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-800 cursor-not-allowed opacity-80"
                />
              </div>

              {/* Room Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Room Number</label>
                <input
                  type="text"
                  value={user?.roomNumber || 'Not Assigned'}
                  readOnly
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-800 cursor-not-allowed opacity-80"
                />
              </div>
            </div>
            
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-slate-50"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-slate-50"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for leave..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-slate-50 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Apply Leave'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
