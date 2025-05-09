import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { name: 'Templates', to: '/dashboard/templates', icon: DocumentDuplicateIcon },
  { name: 'Checklists', to: '/dashboard/checklists', icon: ClipboardDocumentCheckIcon },
  { name: 'Profile', to: '/dashboard/profile', icon: UserCircleIcon },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/dashboard" className="flex items-center">
              <svg
                className="h-8 w-8 text-primary-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">SecureListify</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:dark:bg-gray-800 lg:dark:border-gray-700">
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center">
            <svg
              className="h-8 w-8 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">SecureListify</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 mr-2"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
              
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 shadow-sm-up py-4">
          <div className="px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} SecureListify. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout; 