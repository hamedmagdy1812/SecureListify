import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api'; // Import API directly for testing

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Debug function to test mock API directly
  const testMockApi = async () => {
    try {
      setDebugInfo("Testing mock API...");
      const testData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      };
      
      // Make direct API call
      const response = await api.post('/api/auth/register', testData);
      console.log("Direct API test response:", response);
      setDebugInfo(JSON.stringify(response.data, null, 2));
      
      toast.success("API test completed. Check console and debug info below.");
    } catch (error) {
      console.error("API test error:", error);
      setDebugInfo(error.message);
      toast.error("API test failed. See console for details.");
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Name is required')
        .max(50, 'Name must be 50 characters or less'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        console.log('Submitting registration form with values:', values);
        const result = await register(values.name, values.email, values.password);
        console.log('Registration result:', result);
        
        if (result.success) {
          toast.success('Registration successful!');
          navigate('/dashboard');
        } else {
          toast.error(result.message || 'Registration failed');
          console.error('Registration failed with message:', result.message);
        }
      } catch (error) {
        console.error('Unexpected error during registration:', error);
        toast.error('An unexpected error occurred during registration');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="card p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create an account</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign up to get started with SecureListify
        </p>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className={`input ${
              formik.touched.name && formik.errors.name ? 'border-danger-500' : ''
            }`}
            placeholder="John Doe"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-sm text-danger-600">{formik.errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={`input ${
              formik.touched.email && formik.errors.email ? 'border-danger-500' : ''
            }`}
            placeholder="you@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-danger-600">{formik.errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={`input ${
              formik.touched.password && formik.errors.password ? 'border-danger-500' : ''
            }`}
            placeholder="••••••••"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-sm text-danger-600">{formik.errors.password}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="label">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`input ${
              formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-danger-500' : ''
            }`}
            placeholder="••••••••"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="mt-1 text-sm text-danger-600">{formik.errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Creating account...
            </div>
          ) : (
            'Sign up'
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-500">
          Sign in
        </Link>
      </div>
      
      {/* Debug section */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={testMockApi}
          className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
        >
          Test Mock API
        </button>
        {debugInfo && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
            <pre>{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register; 