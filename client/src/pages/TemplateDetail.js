import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await api.get(`/api/templates/${id}`);
        setTemplate(response.data.data);
      } catch (error) {
        console.error('Error fetching template:', error);
        toast.error('Failed to load template details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      systemType: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      description: Yup.string(),
      systemType: Yup.string().required('System type is required'),
    }),
    onSubmit: async (values) => {
      setIsCreating(true);
      try {
        const response = await api.post('/api/checklists', {
          ...values,
          baseTemplateId: id,
        });
        
        toast.success('Checklist created successfully!');
        navigate(`/dashboard/checklists/${response.data.data._id}`);
      } catch (error) {
        console.error('Error creating checklist:', error);
        toast.error('Failed to create checklist');
      } finally {
        setIsCreating(false);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Template not found</p>
        <button
          onClick={() => navigate('/dashboard/templates')}
          className="btn btn-primary mt-4"
        >
          Back to Templates
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{template.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {template.systemType} • {template.items.length} items
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          Create Checklist
        </button>
      </div>

      {showCreateForm && (
        <div className="card p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Checklist</h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="label">Checklist Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className={`input ${
                  formik.touched.name && formik.errors.name ? 'border-danger-500' : ''
                }`}
                placeholder="My Security Checklist"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1 text-sm text-danger-600">{formik.errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="label">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="input"
                placeholder="Describe the purpose of this checklist"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="systemType" className="label">System Type</label>
              <select
                id="systemType"
                name="systemType"
                className={`input ${
                  formik.touched.systemType && formik.errors.systemType ? 'border-danger-500' : ''
                }`}
                value={formik.values.systemType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select a system type</option>
                <option value={template.systemType}>{template.systemType}</option>
                <option value="Custom">Custom</option>
              </select>
              {formik.touched.systemType && formik.errors.systemType && (
                <p className="mt-1 text-sm text-danger-600">{formik.errors.systemType}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="btn btn-outline border-gray-300 mr-2"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isCreating}
              >
                {isCreating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Checklist'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Description</h2>
        <p className="text-gray-700 dark:text-gray-300">{template.description}</p>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Checklist Items</h2>
        </div>
        
        {/* Group items by category */}
        {Object.entries(
          template.items.reduce((acc, item) => {
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
                  <div className="flex items-start">
                    <div className={`mt-0.5 mr-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                      item.riskRating === 'Critical' ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300' :
                      item.riskRating === 'High' ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300' :
                      item.riskRating === 'Medium' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300' :
                      'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300'
                    }`}>
                      {item.riskRating}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
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
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateDetail; 