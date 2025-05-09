import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
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
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="templates" element={<Templates />} />
              <Route path="templates/:id" element={<TemplateDetail />} />
              <Route path="checklists" element={<Checklists />} />
              <Route path="checklists/:id" element={<ChecklistDetail />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 