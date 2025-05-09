import axios from 'axios';

// Create API instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API for development without backend
const isMockEnabled = process.env.REACT_APP_USE_MOCK === 'true';
console.log('API initialization - Mock mode enabled:', isMockEnabled);

// Mock data
const mockData = {
  user: {
    _id: 'mock_user_id',
    name: 'Mock User',
    email: 'user@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  templates: [
    {
      _id: 'template_1',
      name: 'Linux Server Hardening',
      description: 'Security checklist for hardening Linux servers based on CIS benchmarks',
      systemType: 'Linux Server',
      isPublic: true,
      createdBy: { _id: 'admin_id', name: 'Admin User', email: 'admin@example.com' },
      items: [
        {
          _id: 'item_1',
          title: 'Ensure filesystem integrity is regularly checked',
          description: 'Implement and run file integrity monitoring tools regularly to ensure the integrity of critical system files.',
          riskRating: 'High',
          referenceUrl: 'https://www.cisecurity.org/benchmark/linux',
          category: 'File System',
          tags: ['integrity', 'monitoring'],
          complianceFrameworks: ['CIS', 'NIST SP 800-53']
        },
        {
          _id: 'item_2',
          title: 'Ensure SSH root login is disabled',
          description: 'Root login should be disabled to prevent direct root access via SSH.',
          riskRating: 'Critical',
          referenceUrl: 'https://www.cisecurity.org/benchmark/linux',
          category: 'SSH Configuration',
          tags: ['ssh', 'root', 'access'],
          complianceFrameworks: ['CIS', 'NIST SP 800-53', 'ISO 27001']
        }
      ]
    }
  ],
  checklists: []
};

// Simple mock implementation
if (isMockEnabled) {
  console.log('Setting up mock API');
  
  // Override the post method for mock mode
  const originalPost = api.post;
  api.post = function(url, data, config) {
    console.log('Mock API post:', url, data);
    
    // Handle auth endpoints
    if (url === '/api/auth/register') {
      console.log('Mock API: Handling registration');
      
      // Create mock user from request data
      const mockUser = {
        _id: 'mock_user_id_' + Date.now(),
        name: data.name || 'New User',
        email: data.email || 'user@example.com',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // Update mock data
      mockData.user = mockUser;
      
      // Return success response
      return Promise.resolve({
        data: {
          success: true,
          token: 'mock_token_' + Date.now(),
          user: mockUser
        }
      });
    }
    
    if (url === '/api/auth/login') {
      console.log('Mock API: Handling login');
      
      // Return success response with mock user
      return Promise.resolve({
        data: {
          success: true,
          token: 'mock_token_' + Date.now(),
          user: mockData.user
        }
      });
    }
    
    if (url === '/api/auth/logout') {
      console.log('Mock API: Handling logout');
      
      // Return success response
      return Promise.resolve({
        data: {
          success: true,
          message: 'Logged out successfully'
        }
      });
    }
    
    // For any other endpoints, pass through to original implementation
    console.log('Mock API: Passing through to original implementation');
    return originalPost(url, data, config);
  };
  
  // Override the get method for mock mode
  const originalGet = api.get;
  api.get = function(url, config) {
    console.log('Mock API get:', url);
    
    // Handle auth endpoints
    if (url === '/api/auth/me') {
      console.log('Mock API: Handling get current user');
      
      // Return success response with mock user
      return Promise.resolve({
        data: {
          success: true,
          data: mockData.user
        }
      });
    }
    
    // Handle template endpoints
    if (url === '/api/templates') {
      console.log('Mock API: Handling get all templates');
      
      // Return success response with mock templates
      return Promise.resolve({
        data: {
          success: true,
          count: mockData.templates.length,
          data: mockData.templates
        }
      });
    }
    
    if (url.startsWith('/api/templates/')) {
      console.log('Mock API: Handling get template detail');
      
      // Get template ID from URL
      const templateId = url.split('/').pop();
      
      // Find template by ID or return first template
      const template = mockData.templates.find(t => t._id === templateId) || mockData.templates[0];
      
      // Return success response with template
      return Promise.resolve({
        data: {
          success: true,
          data: template
        }
      });
    }
    
    // Handle checklist endpoints
    if (url === '/api/checklists') {
      console.log('Mock API: Handling get all checklists');
      
      // Return success response with mock checklists
      return Promise.resolve({
        data: {
          success: true,
          count: mockData.checklists.length,
          data: mockData.checklists
        }
      });
    }
    
    // For any other endpoints, pass through to original implementation
    console.log('Mock API: Passing through to original implementation');
    return originalGet(url, config);
  };
}

// Add a request interceptor for logging
api.interceptors.request.use(
  (config) => {
    // Safely access method and URL
    const method = config.method ? config.method.toUpperCase() : 'UNKNOWN';
    const url = config.url || 'unknown-url';
    
    console.log(`API Request: ${method} ${url}`);
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // Safely access URL
    const url = response.config?.url || 'unknown-url';
    console.log(`API Response: ${response.status} ${url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 