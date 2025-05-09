import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Checklists = () => {
  const [checklists, setChecklists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemTypeFilter, setSystemTypeFilter] = useState('');
  
  const systemTypes = [
    'Linux Server', 
    'Windows Server', 
    'Web Application', 
    'Docker Container', 
    'Kubernetes Cluster', 
    'AWS EC2', 
    'AWS S3', 
    'Azure VM', 
    'GCP Compute',
    'Network Device',
    'Database',
    'Custom'
  ];

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const response = await api.get('/api/checklists');
        setChecklists(response.data.data || []);
      } catch (error) {
        console.error('Error fetching checklists:', error);
        toast.error('Failed to load checklists');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChecklists();
  }, []);

  // Filter checklists by system type
  const filteredChecklists = systemTypeFilter
    ? checklists.filter(checklist => checklist.systemType === systemTypeFilter)
    : checklists;

  const handleDeleteChecklist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this checklist?')) {
      return;
    }
    
    try {
      await api.delete(`/api/checklists/${id}`);
      setChecklists(checklists.filter(checklist => checklist._id !== id));
      toast.success('Checklist deleted successfully');
    } catch (error) {
      console.error('Error deleting checklist:', error);
      toast.error('Failed to delete checklist');
    }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Checklists</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your security checklists
          </p>
        </div>
        <Link to="/dashboard/templates" className="btn btn-primary">
          Create New Checklist
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label htmlFor="systemTypeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Filter by System Type
        </label>
        <select
          id="systemTypeFilter"
          name="systemTypeFilter"
          className="input"
          value={systemTypeFilter}
          onChange={(e) => setSystemTypeFilter(e.target.value)}
        >
          <option value="">All System Types</option>
          {systemTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {filteredChecklists.length > 0 ? (
        <div className="space-y-4">
          {filteredChecklists.map((checklist) => (
            <div key={checklist._id} className="card">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {checklist.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {checklist.systemType} • Created on {new Date(checklist.createdAt).toLocaleDateString()}
                    </p>
                    {checklist.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        {checklist.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/dashboard/checklists/${checklist._id}`}
                      className="btn btn-primary text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteChecklist(checklist._id)}
                      className="btn btn-danger text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.round((checklist.progress?.done / (checklist.progress?.total || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${Math.round((checklist.progress?.done / (checklist.progress?.total || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    <span className="font-medium">Not Started:</span> {checklist.progress?.notStarted || 0}
                  </div>
                  <div className="bg-warning-100 dark:bg-warning-900 px-2 py-1 rounded text-xs text-warning-800 dark:text-warning-300">
                    <span className="font-medium">In Progress:</span> {checklist.progress?.inProgress || 0}
                  </div>
                  <div className="bg-success-100 dark:bg-success-900 px-2 py-1 rounded text-xs text-success-800 dark:text-success-300">
                    <span className="font-medium">Done:</span> {checklist.progress?.done || 0}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    <span className="font-medium">N/A:</span> {checklist.progress?.notApplicable || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No checklists found</p>
          <Link to="/dashboard/templates" className="btn btn-primary">
            Create your first checklist
          </Link>
        </div>
      )}
    </div>
  );
};

export default Checklists; 