import React from 'react';
import { CalendarProps } from '@/types/ui';

export const Calendar: React.FC<CalendarProps> = ({ className, children }) => {
  return (
    <div className={className}>
      {children}
      Calendar Placeholder
    </div>
  );
};
