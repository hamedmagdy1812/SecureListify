import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Page not found</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="btn btn-primary"
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 