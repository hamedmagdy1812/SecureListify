import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalChecklists: 0,
    totalTemplates: 0,
    completedItems: 0,
    inProgressItems: 0,
    notStartedItems: 0,
    notApplicableItems: 0,
  });
  const [recentChecklists, setRecentChecklists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would have a dedicated endpoint for dashboard data
        // For now, we'll simulate by fetching checklists
        const response = await api.get('/api/checklists');
        const checklists = response.data.data || [];
        
        // Calculate stats
        const totalChecklists = checklists.length;
        const totalTemplates = [...new Set(checklists.map(c => c.baseTemplate?._id).filter(Boolean))].length;
        
        let completedItems = 0;
        let inProgressItems = 0;
        let notStartedItems = 0;
        let notApplicableItems = 0;
        
        checklists.forEach(checklist => {
          completedItems += checklist.progress?.done || 0;
          inProgressItems += checklist.progress?.inProgress || 0;
          notStartedItems += checklist.progress?.notStarted || 0;
          notApplicableItems += checklist.progress?.notApplicable || 0;
        });
        
        setStats({
          totalChecklists,
          totalTemplates,
          completedItems,
          inProgressItems,
          notStartedItems,
          notApplicableItems,
        });
        
        // Get recent checklists (most recently updated)
        const sortedChecklists = [...checklists].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setRecentChecklists(sortedChecklists.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Chart data
  const chartData = {
    labels: ['Completed', 'In Progress', 'Not Started', 'Not Applicable'],
    datasets: [
      {
        data: [
          stats.completedItems,
          stats.inProgressItems,
          stats.notStartedItems,
          stats.notApplicableItems,
        ],
        backgroundColor: [
          '#22c55e', // success-500
          '#f59e0b', // warning-500
          '#ef4444', // danger-500
          '#6b7280', // gray-500
        ],
        borderColor: [
          '#16a34a', // success-600
          '#d97706', // warning-600
          '#dc2626', // danger-600
          '#4b5563', // gray-600
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name || 'User'}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Checklists</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalChecklists}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Templates Used</h3>
          <p className="text-3xl font-bold text-secondary-600">{stats.totalTemplates}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Completed Items</h3>
          <p className="text-3xl font-bold text-success-600">{stats.completedItems}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">In Progress Items</h3>
          <p className="text-3xl font-bold text-warning-600">{stats.inProgressItems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Progress Overview</h2>
          <div className="h-64">
            {stats.completedItems + stats.inProgressItems + stats.notStartedItems + stats.notApplicableItems > 0 ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent checklists */}
        <div className="card p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Checklists</h2>
          {recentChecklists.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentChecklists.map((checklist) => (
                <li key={checklist._id} className="py-3">
                  <Link
                    to={`/dashboard/checklists/${checklist._id}`}
                    className="flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{checklist.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {checklist.systemType} • Updated {new Date(checklist.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-success-600">
                        {Math.round((checklist.progress?.done / (checklist.progress?.total || 1)) * 100)}%
                      </span>
                      <svg
                        className="ml-2 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No checklists yet</p>
              <Link to="/dashboard/templates" className="btn btn-primary">
                Create your first checklist
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/dashboard/templates"
            className="card p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="h-8 w-8 text-primary-500 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Browse Templates</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Find security templates for your systems
              </p>
            </div>
          </Link>
          <Link
            to="/dashboard/checklists"
            className="card p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="h-8 w-8 text-secondary-500 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">View Checklists</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your security checklists
              </p>
            </div>
          </Link>
          <Link
            to="/dashboard/profile"
            className="card p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="h-8 w-8 text-gray-500 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Profile Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your account preferences
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 