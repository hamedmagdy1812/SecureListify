import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ChecklistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('read');

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await api.get(`/api/checklists/${id}`);
        setChecklist(response.data.data);
      } catch (error) {
        console.error('Error fetching checklist:', error);
        toast.error('Failed to load checklist details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklist();
  }, [id]);

  const handleStatusChange = async (itemId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await api.put(`/api/checklists/${id}/items/${itemId}`, {
        status: newStatus
      });
      setChecklist(response.data.data);
      toast.success(`Item marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNotes = async (itemId, notes) => {
    setIsUpdating(true);
    try {
      const response = await api.put(`/api/checklists/${id}/items/${itemId}`, {
        notes
      });
      setChecklist(response.data.data);
      toast.success('Notes updated');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareChecklist = async (e) => {
    e.preventDefault();
    
    if (!shareEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    try {
      await api.post(`/api/checklists/${id}/share`, {
        email: shareEmail,
        permission: sharePermission
      });
      
      toast.success(`Checklist shared with ${shareEmail}`);
      setShareEmail('');
      setSharePermission('read');
      setShowShareModal(false);
      
      // Refresh checklist data to show updated sharing info
      const response = await api.get(`/api/checklists/${id}`);
      setChecklist(response.data.data);
    } catch (error) {
      console.error('Error sharing checklist:', error);
      toast.error('Failed to share checklist');
    }
  };

  const handleRemoveShare = async (userId) => {
    try {
      await api.delete(`/api/checklists/${id}/share/${userId}`);
      
      toast.success('Sharing permission removed');
      
      // Refresh checklist data to show updated sharing info
      const response = await api.get(`/api/checklists/${id}`);
      setChecklist(response.data.data);
    } catch (error) {
      console.error('Error removing share:', error);
      toast.error('Failed to remove sharing permission');
    }
  };

  const handleExport = async (format) => {
    try {
      // For PDF, we need to open in a new tab
      if (format === 'pdf') {
        window.open(`${api.defaults.baseURL}/api/export/${id}/pdf`, '_blank');
        return;
      }
      
      // For other formats, trigger download
      window.location.href = `${api.defaults.baseURL}/api/export/${id}/${format}`;
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      toast.error(`Failed to export to ${format}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Checklist not found</p>
        <button
          onClick={() => navigate('/dashboard/checklists')}
          className="btn btn-primary mt-4"
        >
          Back to Checklists
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{checklist.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {checklist.systemType} • Created on {new Date(checklist.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="dropdown relative">
            <button className="btn btn-outline border-gray-300 flex items-center">
              Export
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 hidden">
              <button 
                onClick={() => handleExport('pdf')}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                Export as PDF
              </button>
              <button 
                onClick={() => handleExport('markdown')}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                Export as Markdown
              </button>
              <button 
                onClick={() => handleExport('json')}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                Export as JSON
              </button>
              <button 
                onClick={() => handleExport('yaml')}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                Export as YAML
              </button>
            </div>
          </div>
          <button 
            onClick={() => setShowShareModal(true)}
            className="btn btn-outline border-gray-300"
          >
            Share
          </button>
        </div>
      </div>

      {/* Progress summary */}
      <div className="card p-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Not Started</div>
            <div className="text-2xl font-bold">{checklist.progress?.notStarted || 0}</div>
          </div>
          <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-lg">
            <div className="text-sm text-warning-800 dark:text-warning-300">In Progress</div>
            <div className="text-2xl font-bold text-warning-800 dark:text-warning-300">{checklist.progress?.inProgress || 0}</div>
          </div>
          <div className="bg-success-100 dark:bg-success-900 p-3 rounded-lg">
            <div className="text-sm text-success-800 dark:text-success-300">Done</div>
            <div className="text-2xl font-bold text-success-800 dark:text-success-300">{checklist.progress?.done || 0}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Not Applicable</div>
            <div className="text-2xl font-bold">{checklist.progress?.notApplicable || 0}</div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Overall Progress</span>
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
      </div>

      {/* Checklist items */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Checklist Items</h2>
        </div>
        
        {/* Group items by category */}
        {Object.entries(
          checklist.items.reduce((acc, item) => {
            if (!acc[item.category]) {
              acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
          }, {})
        ).map(([category, items]) => (
          <div key={category} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium text-gray-900 dark:text-white">{category}</h3>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <li key={item._id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className={`mt-0.5 mr-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                          item.riskRating === 'Critical' ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300' :
                          item.riskRating === 'High' ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300' :
                          item.riskRating === 'Medium' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300' :
                          'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300'
                        }`}>
                          {item.riskRating}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      <div className="mt-2">
                        <a
                          href={item.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:text-primary-500"
                        >
                          Reference Link
                        </a>
                      </div>
                      
                      {/* Notes section */}
                      <div className="mt-3">
                        <details className="text-sm">
                          <summary className="text-gray-700 dark:text-gray-300 cursor-pointer">
                            {item.notes ? 'View/Edit Notes' : 'Add Notes'}
                          </summary>
                          <div className="mt-2">
                            <textarea
                              className="input text-sm"
                              rows="2"
                              placeholder="Add notes about this item..."
                              defaultValue={item.notes || ''}
                              onBlur={(e) => handleAddNotes(item._id, e.target.value)}
                            ></textarea>
                          </div>
                        </details>
                      </div>
                      
                      {/* Completion info if completed */}
                      {item.status === 'Done' && item.completedAt && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Completed on {new Date(item.completedAt).toLocaleString()}
                          {item.completedBy && ` by ${item.completedBy.name}`}
                        </div>
                      )}
                    </div>
                    
                    {/* Status dropdown */}
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <select
                        className={`input text-sm ${
                          item.status === 'Done' ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-300' :
                          item.status === 'In Progress' ? 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-300' :
                          item.status === 'Not Applicable' ? 'bg-gray-100 dark:bg-gray-800' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        disabled={isUpdating}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowShareModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                  Share Checklist
                </h3>
                <form onSubmit={handleShareChecklist}>
                  <div className="mb-4">
                    <label htmlFor="shareEmail" className="label">Email Address</label>
                    <input
                      type="email"
                      id="shareEmail"
                      className="input"
                      placeholder="user@example.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="sharePermission" className="label">Permission</label>
                    <select
                      id="sharePermission"
                      className="input"
                      value={sharePermission}
                      onChange={(e) => setSharePermission(e.target.value)}
                    >
                      <option value="read">Read only</option>
                      <option value="write">Read and write</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="btn btn-outline border-gray-300 mr-2"
                      onClick={() => setShowShareModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Share
                    </button>
                  </div>
                </form>
                
                {/* Currently shared with */}
                {checklist.sharedWith && checklist.sharedWith.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currently shared with:
                    </h4>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {checklist.sharedWith.map((share) => (
                        <li key={share.user._id} className="py-2 flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {share.user.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {share.user.email} • {share.permission === 'read' ? 'Read only' : 'Read and write'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveShare(share.user._id)}
                            className="text-danger-600 hover:text-danger-500 text-sm"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistDetail; 