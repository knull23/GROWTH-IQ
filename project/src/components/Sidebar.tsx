import React from 'react';
import { BarChart3, Settings, Brain, TrendingUp } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'admin';
  onViewChange: (view: 'dashboard' | 'admin') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navigation = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      view: 'dashboard' as const,
      description: 'Revenue forecasting and analytics',
    },
    {
      name: 'Admin Panel',
      icon: Settings,
      view: 'admin' as const,
      description: 'Model management and configuration',
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">GrowthIQ</h2>
            <p className="text-sm text-gray-500">Enterprise AI Forecasting</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => onViewChange(item.view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentView === item.view
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">System Status</div>
            <div className="text-xs text-green-600">All systems operational</div>
          </div>
        </div>
      </div>
    </div>
  );
};