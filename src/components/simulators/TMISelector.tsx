import React from 'react';

interface TMISelectorProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

const TMI_OPTIONS = [
  { value: 0, label: '0%', description: 'Non imposable' },
  { value: 11, label: '11%', description: 'Tranche 1' },
  { value: 30, label: '30%', description: 'Tranche 2' },
  { value: 41, label: '41%', description: 'Tranche 3' },
  { value: 45, label: '45%', description: 'Tranche 4' }
];

export const TMISelector: React.FC<TMISelectorProps> = ({
  value,
  onChange,
  label = 'Tranche marginale d\'imposition (TMI)',
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {TMI_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - {option.description}
          </option>
        ))}
      </select>
    </div>
  );
};
