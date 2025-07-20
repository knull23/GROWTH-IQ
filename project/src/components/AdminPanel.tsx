import React, { useState } from 'react';
import { RefreshCw, Upload, Database, Settings, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  onRetrain: () => Promise<void>;
  isLoading: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRetrain, isLoading }) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    
    // Simulate upload process
    console.log('Uploading file:', uploadFile.name);
    setUploadFile(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage models, data, and system configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Model Management</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">SARIMA Model</span>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-sm text-gray-600">Last trained: 2 hours ago</p>
              <p className="text-sm text-gray-600">Accuracy: 85.2%</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">LSTM Model</span>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-sm text-gray-600">Last trained: 1 hour ago</p>
              <p className="text-sm text-gray-600">Accuracy: 87.4%</p>
            </div>
            
            <button
              onClick={onRetrain}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Retraining...' : 'Retrain Models'}
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Dataset
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            {uploadFile && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">{uploadFile.name}</span>
                  <button
                    onClick={handleUploadSubmit}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Upload
                  </button>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Database Status</span>
              </div>
              <p className="text-sm text-gray-600">Last sync: 30 minutes ago</p>
              <p className="text-sm text-gray-600">Records: 24,576</p>
            </div>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-retrain Schedule</span>
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">FRED API Integration</span>
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Connected</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Notifications</span>
              <button className="text-sm text-blue-600 hover:text-blue-800">Configure</button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response Time</span>
              <span className="text-sm text-green-600">125ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <span className="text-sm text-green-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Model Performance</span>
              <span className="text-sm text-green-600">Good</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Memory Usage</span>
              <span className="text-sm text-yellow-600">72%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};