import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Spinner } from '../components/ui/Spinner';
import * as settingsService from '../services/settings.service';

export const AdminSettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    enableGlobalNotifications: true,
    maintenanceMode: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await settingsService.getSettings();
      if (res.success && res.data) {
        setFormData({
          enableGlobalNotifications: res.data.enableGlobalNotifications ?? true,
          maintenanceMode: res.data.maintenanceMode || false,
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const res = await settingsService.updateSettings(formData);
      if (res.success) {
        toast.success('Settings updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-8">
              <Settings className="h-5 w-5 text-slate-800" />
              <h2 className="text-lg font-bold text-slate-800">
                System Settings
              </h2>
            </div>
            
            <div className="space-y-4 mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  name="enableGlobalNotifications"
                  checked={formData.enableGlobalNotifications}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-[15px] font-medium text-slate-600">Enable Global Notifications</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  name="maintenanceMode"
                  checked={formData.maintenanceMode}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-[15px] font-medium text-slate-600">Maintenance Mode</span>
              </label>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center min-w-[140px]"
            >
              {isSaving ? <Spinner size="sm" className="text-white mr-2" /> : null}
              Save Settings
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};
