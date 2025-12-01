import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const AuthTest: React.FC = () => {
  const { user, login, signup, logout } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async () => {
    setIsLoading(true);
    addResult('Testing login...');
    
    try {
      const success = await login('test@example.com', 'password123');
      addResult(success ? '✅ Login successful' : '❌ Login failed');
    } catch (error: any) {
      addResult(`❌ Login error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignup = async () => {
    setIsLoading(true);
    addResult('Testing signup...');
    
    try {
      const success = await signup(
        'Test User',
        `test${Date.now()}@example.com`,
        'password123',
        'employee',
        { skills: ['React', 'TypeScript'] }
      );
      addResult(success ? '✅ Signup successful' : '❌ Signup failed');
    } catch (error: any) {
      addResult(`❌ Signup error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetCurrentUser = async () => {
    setIsLoading(true);
    addResult('Testing get current user...');
    
    try {
      const user = await authAPI.getCurrentUser();
      addResult(`✅ Current user: ${user.name} (${user.email})`);
    } catch (error: any) {
      addResult(`❌ Get current user error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = () => {
    addResult('Testing logout...');
    logout();
    addResult('✅ Logout successful');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Auth Module Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current Status:</h3>
        <p><strong>User:</strong> {user ? `${user.name} (${user.email})` : 'Not logged in'}</p>
        <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
        <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Not present'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Actions:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={testLogin} 
            disabled={isLoading}
            style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Test Login
          </button>
          <button 
            onClick={testSignup} 
            disabled={isLoading}
            style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Test Signup
          </button>
          <button 
            onClick={testGetCurrentUser} 
            disabled={isLoading}
            style={{ padding: '10px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Test Get User
          </button>
          <button 
            onClick={testLogout}
            style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Test Logout
          </button>
          <button 
            onClick={clearResults}
            style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Clear Results
          </button>
        </div>
      </div>

      <div>
        <h3>Test Results:</h3>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '5px', 
          padding: '15px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {testResults.length === 0 ? (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No tests run yet. Click a test button above.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} style={{ marginBottom: '5px', fontFamily: 'monospace' }}>
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h4>API Endpoints Tested:</h4>
        <ul>
          <li><strong>POST /api/auth/login</strong> - User login</li>
          <li><strong>POST /api/auth/register</strong> - User registration</li>
          <li><strong>GET /api/auth/me</strong> - Get current user</li>
        </ul>
        <p><strong>Backend URL:</strong> {process.env.REACT_APP_API_URL || 'https://mcb.instatripplan.com/api'}</p>
      </div>
    </div>
  );
};

export default AuthTest;
