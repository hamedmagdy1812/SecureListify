import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Templates from './pages/Templates';
import TemplateDetail from './pages/TemplateDetail';
import Checklists from './pages/Checklists';
import ChecklistDetail from './pages/ChecklistDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  useEffect(() => {
    // Check if mock mode is enabled
    const isMockEnabled = process.env.REACT_APP_USE_MOCK === 'true';
    console.log('REACT_APP_USE_MOCK:', process.env.REACT_APP_USE_MOCK);
    console.log('Mock mode enabled:', isMockEnabled);
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="templates" element={<Templates />} />
          <Route path="templates/:id" element={<TemplateDetail />} />
          <Route path="checklists" element={<Checklists />} />
          <Route path="checklists/:id" element={<ChecklistDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App; 