import axios from 'axios';

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

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If mock is enabled, intercept the request
    if (isMockEnabled) {
      const { method, url } = config;
      console.log(`Mock API intercepted: ${method} ${url}`);
      
      // Handle auth endpoints
      if (url.includes('/api/auth/login') && method === 'post') {
        console.log('Mock API: Processing login request');
        return mockResponse(config, 200, {
          success: true,
          token: 'mock_token',
          user: mockData.user
        });
      }
      
      if (url.includes('/api/auth/register') && method === 'post') {
        console.log('Mock API: Processing registration request', config.data);
        
        // Parse request data if it's a string
        let userData;
        try {
          userData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        } catch (error) {
          console.error('Error parsing registration data:', error);
          userData = config.data || {};
        }
        
        console.log('Parsed user data:', userData);
        
        // Create a mock user
        const mockUser = { 
          _id: 'mock_user_id_' + Date.now(),
          name: userData.name || 'New User',
          email: userData.email || 'user@example.com',
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        // Update the mock data with the new user
        mockData.user = mockUser;
        
        console.log('Created mock user:', mockUser);
        
        // Return a successful response
        return mockResponse(config, 201, {
          success: true,
          token: 'mock_token_' + Date.now(),
          user: mockUser
        });
      }
      
      if (url.includes('/api/auth/me') && method === 'get') {
        return mockResponse(config, 200, {
          success: true,
          data: mockData.user
        });
      }
      
      // Handle template endpoints
      if (url.includes('/api/templates') && method === 'get' && !url.includes('/api/templates/')) {
        return mockResponse(config, 200, {
          success: true,
          count: mockData.templates.length,
          data: mockData.templates
        });
      }
      
      if (url.match(/\/api\/templates\/[^/]+$/) && method === 'get') {
        const templateId = url.split('/').pop();
        const template = mockData.templates.find(t => t._id === templateId) || mockData.templates[0];
        return mockResponse(config, 200, {
          success: true,
          data: template
        });
      }
      
      // Handle checklist endpoints
      if (url.includes('/api/checklists') && method === 'get' && !url.includes('/api/checklists/')) {
        return mockResponse(config, 200, {
          success: true,
          count: mockData.checklists.length,
          data: mockData.checklists
        });
      }
      
      if (url.includes('/api/checklists') && method === 'post') {
        const requestData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        const newChecklist = {
          _id: `checklist_${mockData.checklists.length + 1}`,
          ...requestData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: mockData.user._id,
          items: [],
          progress: {
            notStarted: 0,
            inProgress: 0,
            done: 0,
            notApplicable: 0,
            total: 0
          }
        };
        
        // If baseTemplateId is provided, copy items from template
        if (requestData.baseTemplateId) {
          const template = mockData.templates.find(t => t._id === requestData.baseTemplateId) || mockData.templates[0];
          if (template) {
            newChecklist.items = template.items.map((item, index) => ({
              ...item,
              _id: `checklist_item_${index + 1}`,
              status: 'Not Started',
              order: index
            }));
            
            newChecklist.progress = {
              notStarted: newChecklist.items.length,
              inProgress: 0,
              done: 0,
              notApplicable: 0,
              total: newChecklist.items.length
            };
          }
        }
        
        mockData.checklists.push(newChecklist);
        
        return mockResponse(config, 201, {
          success: true,
          data: newChecklist
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
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

// Helper function to create mock responses
function mockResponse(request, status, data) {
  console.log('Creating mock response:', { status, data });
  
  // Create a proper axios response-like object
  const response = {
    status,
    statusText: status === 200 ? 'OK' : 'Created',
    headers: request.headers,
    config: request,
    data
  };
  
  // Return a resolved promise with the response
  return Promise.resolve(response);
}

export default api; 