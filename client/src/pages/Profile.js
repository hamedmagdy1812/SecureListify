import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Name is required')
        .max(50, 'Name must be 50 characters or less'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    }),
    onSubmit: async (values) => {
      setIsUpdating(true);
      try {
        // In a real app, you would have a dedicated endpoint for updating profile
        // This is a placeholder for demonstration purposes
        await api.put('/api/users/profile', values);
        toast.success('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      } finally {
        setIsUpdating(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .required('New password is required')
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      setIsUpdating(true);
      try {
        // In a real app, you would have a dedicated endpoint for changing password
        // This is a placeholder for demonstration purposes
        await api.put('/api/users/change-password', {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success('Password changed successfully');
        passwordFormik.resetForm();
        setShowPasswordForm(false);
      } catch (error) {
        console.error('Error changing password:', error);
        toast.error('Failed to change password');
      } finally {
        setIsUpdating(false);
      }
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Information</h2>
            <form onSubmit={profileFormik.handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="label">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`input ${
                    profileFormik.touched.name && profileFormik.errors.name ? 'border-danger-500' : ''
                  }`}
                  value={profileFormik.values.name}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                />
                {profileFormik.touched.name && profileFormik.errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{profileFormik.errors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`input ${
                    profileFormik.touched.email && profileFormik.errors.email ? 'border-danger-500' : ''
                  }`}
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                />
                {profileFormik.touched.email && profileFormik.errors.email && (
                  <p className="mt-1 text-sm text-danger-600">{profileFormik.errors.email}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Password</h2>
              <button
                type="button"
                className="btn btn-outline border-gray-300 text-sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm ? (
              <form onSubmit={passwordFormik.handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="label">Current Password</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    className={`input ${
                      passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword ? 'border-danger-500' : ''
                    }`}
                    value={passwordFormik.values.currentPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                  />
                  {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                    <p className="mt-1 text-sm text-danger-600">{passwordFormik.errors.currentPassword}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="newPassword" className="label">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className={`input ${
                      passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? 'border-danger-500' : ''
                    }`}
                    value={passwordFormik.values.newPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                  />
                  {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                    <p className="mt-1 text-sm text-danger-600">{passwordFormik.errors.newPassword}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className={`input ${
                      passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? 'border-danger-500' : ''
                    }`}
                    value={passwordFormik.values.confirmPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                  />
                  {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-danger-600">{passwordFormik.errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Click the button above to change your password.
              </p>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Account</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Login</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={logout}
                  className="btn btn-danger w-full"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 