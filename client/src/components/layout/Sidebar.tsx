import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  MessageSquareText, 
  Bell, 
  UserCircle, 
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Lightbulb,
  ClipboardList,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
  onOpenComplaintModal?: () => void;
  onOpenLeaveModal?: () => void;
  onOpenSosModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, onOpenComplaintModal, onOpenLeaveModal, onOpenSosModal }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const commonLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chat', icon: MessageSquareText, label: 'AI Chat', highlight: true },
    { to: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/activity', icon: FileText, label: 'My Activity' },
    { to: '/requests', icon: ClipboardList, label: 'Submit Complaint' },
    { to: '/apply-leave', icon: CheckSquare, label: 'Apply Leave' },
    { to: '/sos', icon: AlertTriangle, label: 'SOS Emergency', sos: true },
    { to: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  // Admin sidebar links
  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Manage Students' },
    { to: '/admin/wardens', icon: UserCircle, label: 'Manage Wardens' },
    { to: '/admin/reports', icon: FileText, label: 'System Reports' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  // Warden sidebar links — matched to the reference image
  const wardenLinks = [
    { to: '/warden/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/warden/complaints', icon: ClipboardList, label: 'Manage Complaints' },
    { to: '/warden/leaves', icon: CheckSquare, label: 'Approve Leaves' },
    { to: '/warden/alerts', icon: AlertTriangle, label: 'Emergency Alerts' },
    { to: '/warden/insights', icon: Lightbulb, label: 'AI Insights', highlight: true },
    { to: '/warden/reports', icon: FileText, label: 'Hostel Reports' },
  ];

  let links: any[] = [...commonLinks];
  if (user?.role === 'admin') {
    links = [...adminLinks];
  } else if (user?.role === 'warden') {
    links = [...wardenLinks];
  } else {
    links = [...studentLinks];
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo area */}
        <div className="h-[72px] flex items-center px-6 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden text-blue-600">
            <Building2 className="h-6 w-6 shrink-0" />
            <span className={`font-bold text-xl whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              SmartHostel
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 px-4 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            
            // SOS Emergency special button
            if (link.sos && onOpenSosModal) {
              return (
                <button
                  key={link.to + '-sos'}
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenSosModal();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors mt-2 shadow-sm"
                  title={collapsed ? link.label : undefined}
                >
                  <link.icon className="h-5 w-5 shrink-0 text-white" />
                  <span className={`whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                    {link.label}
                  </span>
                </button>
              );
            }
            // Submit Complaint special button
            if (link.label === 'Submit Complaint' && onOpenComplaintModal) {
              return (
                <button
                  key={link.to + '-complaint'}
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenComplaintModal();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-medium text-sm ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                  title={collapsed ? link.label : undefined}
                >
                  <link.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className={`whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                    {link.label}
                  </span>
                </button>
              );
            }
            // Apply Leave special button
            if (link.label === 'Apply Leave' && onOpenLeaveModal) {
              return (
                <button
                  key={link.to + '-leave'}
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenLeaveModal();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-medium text-sm ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                  title={collapsed ? link.label : undefined}
                >
                  <link.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className={`whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                    {link.label}
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-medium text-sm ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                  {link.label}
                </span>
                {link.highlight && !collapsed && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Logout Button (matched to image position) */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors font-medium text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 mt-2"
          >
            <LogOut className="h-5 w-5 shrink-0 text-slate-400" />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              Logout
            </span>
          </button>
        </nav>
      </aside>
    </>
  );
};
