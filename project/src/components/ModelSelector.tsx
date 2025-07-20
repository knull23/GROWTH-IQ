import React from 'react';
import { Brain, TrendingUp } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: 'sarima' | 'lstm';
  onModelChange: (model: 'sarima' | 'lstm') => void;
  isLoading: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  isLoading,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700 font-medium">Model:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onModelChange('sarima')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selectedModel === 'sarima'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          SARIMA
        </button>
        <button
          onClick={() => onModelChange('lstm')}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selectedModel === 'lstm'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="w-4 h-4" />
          LSTM
        </button>
      </div>
    </div>
  );
};