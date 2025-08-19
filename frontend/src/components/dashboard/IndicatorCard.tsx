import React from 'react';

interface IndicatorCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ 
  title, 
  value, 
  icon = '📊',
  trend 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
          <p className="text-white text-2xl font-bold">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-gray-500 text-xs ml-1">vs. período anterior</span>
            </div>
          )}
        </div>
        <div className="text-2xl text-blue-400">{icon}</div>
      </div>
    </div>
  );
};

export default IndicatorCard;
