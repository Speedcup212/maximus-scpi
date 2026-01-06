import React from 'react';
import { Info } from 'lucide-react';

interface SliderNumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  tooltip?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export const SliderNumberField: React.FC<SliderNumberFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = '',
  tooltip,
  formatValue,
  className = ''
}) => {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    // Clamp value within range
    const clampedValue = Math.min(Math.max(newValue, min), max);
    onChange(clampedValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <span>{label}</span>
          {tooltip && (
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute left-0 top-6 w-72 p-3 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                {tooltip}
              </div>
            </div>
          )}
        </label>
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {displayValue}
        </span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
      />

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formatValue ? formatValue(min) : `${min}${unit}`}</span>
        <span>{formatValue ? formatValue(max) : `${max}${unit}`}</span>
      </div>

      {/* Number input */}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleNumberChange}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};
