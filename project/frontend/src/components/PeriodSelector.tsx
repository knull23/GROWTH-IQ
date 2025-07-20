import React from 'react';
import { Calendar } from 'lucide-react';

interface PeriodSelectorProps {
  selectedPeriods: number;
  onPeriodsChange: (periods: number) => void;
  isLoading: boolean;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriods,
  onPeriodsChange,
  isLoading,
}) => {
  const periodOptions = [
    { value: 6, label: '6 months' },
    { value: 12, label: '12 months' },
    { value: 18, label: '18 months' },
    { value: 24, label: '24 months' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-600" />
      <span className="text-sm text-gray-700 font-medium">Forecast:</span>
      <select
        value={selectedPeriods}
        onChange={(e) => onPeriodsChange(Number(e.target.value))}
        disabled={isLoading}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {periodOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};