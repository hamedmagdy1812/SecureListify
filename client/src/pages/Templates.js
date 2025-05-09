import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
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
    const fetchTemplates = async () => {
      try {
        const params = systemTypeFilter ? { systemType: systemTypeFilter } : {};
        const response = await api.get('/api/templates', { params });
        setTemplates(response.data.data || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplates();
  }, [systemTypeFilter]);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Templates</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and select a security template to create a checklist
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label htmlFor="systemType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Filter by System Type
        </label>
        <select
          id="systemType"
          name="systemType"
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

      {/* Templates list */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template._id} className="card">
              <div className="p-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{template.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.systemType}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {template.items.length} items
                  </span>
                  <Link
                    to={`/dashboard/templates/${template._id}`}
                    className="btn btn-primary text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No templates found</p>
        </div>
      )}
    </div>
  );
};

export default Templates; 