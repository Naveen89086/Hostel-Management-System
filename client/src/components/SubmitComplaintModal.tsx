import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as requestService from '../services/request.service';

interface SubmitComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitComplaintModal: React.FC<SubmitComplaintModalProps> = ({ isOpen, onClose }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !category || !description) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await requestService.createRequest({
        type: 'complaint',
        title: `${category} Issue`,
        description,
        roomNumber,
        category,
        urgency: 'medium', // Default urgency for standard complaints
      });

      if (res.success) {
        toast.success('Complaint submitted successfully!');
        setRoomNumber('');
        setCategory('');
        setDescription('');
        onClose();
      } else {
        toast.error(res.message || 'Failed to submit complaint.');
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
          <h2 className="text-xl font-bold text-slate-800">Submit Complaint</h2>
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
            
            {/* Room Number */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Room Number</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="304"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-slate-50"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-slate-50 appearance-none"
              >
                <option value="" disabled>Select Category</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Internet/Wi-Fi">Internet/Wi-Fi</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-800 bg-slate-50 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
