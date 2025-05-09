import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const result = await login(values.email, values.password);
        if (result.success) {
          toast.success('Login successful!');
          navigate('/dashboard');
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('An error occurred during login');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="card p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={formik.handleSubmit}>
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

        <div className="mb-6">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
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

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-500">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login; 