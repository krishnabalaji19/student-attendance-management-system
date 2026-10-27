import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileSpreadsheet,
  CalendarDays,
  Users,
  BookOpen,
  Building2,
  FileText,
  UserCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/manage-users', label: 'Users & Roles', icon: Users },
          { to: '/manage-classes', label: 'Classes & Courses', icon: BookOpen },
          { to: '/mark-attendance', label: 'Mark Attendance', icon: ClipboardCheck },
          { to: '/reports', label: 'Reports & Exports', icon: FileSpreadsheet },
          { to: '/leave-requests', label: 'Leave Applications', icon: CalendarDays },
          { to: '/profile', label: 'My Profile', icon: UserCircle },
        ];
      case 'teacher':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/mark-attendance', label: 'Mark Attendance', icon: ClipboardCheck },
          { to: '/reports', label: 'Class Reports', icon: FileSpreadsheet },
          { to: '/leave-requests', label: 'Leave Approvals', icon: CalendarDays },
          { to: '/profile', label: 'My Profile', icon: UserCircle },
        ];
      case 'student':
        return [
          { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { to: '/leave-requests', label: 'Apply Leave', icon: CalendarDays },
          { to: '/profile', label: 'My Profile', icon: UserCircle },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50 font-semibold shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200/70 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400 text-center">
        <p className="font-semibold text-gray-700 dark:text-gray-300">AttendSync v1.0</p>
        <p className="mt-0.5">Real-world School & College System</p>
      </div>
    </aside>
  );
};

export default Sidebar;
