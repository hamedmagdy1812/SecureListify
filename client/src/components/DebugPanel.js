import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const DebugPanel = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [envVars, setEnvVars] = useState({});
  
  useEffect(() => {
    // Collect environment variables
    setEnvVars({
      REACT_APP_USE_MOCK: process.env.REACT_APP_USE_MOCK,
      NODE_ENV: process.env.NODE_ENV,
    });
  }, []);
  
  const testRegister = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });
      
      const data = await response.json();
      console.log('Direct fetch register response:', data);
      alert('Check console for register test results');
    } catch (error) {
      console.error('Direct fetch register error:', error);
      alert('Register test failed: ' + error.message);
    }
  };
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-md text-xs z-50"
      >
        Debug
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg z-50 w-80 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Debug Panel</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <h4 className="font-semibold">Environment:</h4>
          <pre className="bg-gray-100 dark:bg-gray-700 p-1 rounded mt-1">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-semibold">Auth State:</h4>
          <pre className="bg-gray-100 dark:bg-gray-700 p-1 rounded mt-1">
            {JSON.stringify({
              isAuthenticated,
              isLoading,
              hasToken: !!token,
              user: user || null,
            }, null, 2)}
          </pre>
        </div>
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold">Actions:</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear Token & Reload
            </button>
            
            <button 
              onClick={testRegister}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Test Register API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel; 