import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SubmitComplaintModal } from '../SubmitComplaintModal';
import { ApplyLeaveModal } from '../ApplyLeaveModal';
import { SOSEmergencyModal } from '../SOSEmergencyModal';
import { FloatingChatWidget } from '../FloatingChatWidget';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 selection:bg-primary-200 dark:selection:bg-primary-900">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
        onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar relative">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Floating Chat Widget available globally in layout for all portals */}
      <FloatingChatWidget />

      {/* Modals available to students */}
      <SubmitComplaintModal 
        isOpen={isComplaintModalOpen} 
        onClose={() => setIsComplaintModalOpen(false)} 
      />
      <ApplyLeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
      <SOSEmergencyModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />
    </div>
  );
};
