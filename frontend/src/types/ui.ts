import { ButtonHTMLAttributes, HTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

// Button Component Types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: string;
  size?: string;
}

// Card Component Types
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

// Calendar Component Types
export interface CalendarProps {
  className?: string;
  children?: React.ReactNode;
}

// Select Component Types
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children?: ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
}

export interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children?: ReactNode;
  value: string | number;
}

export interface SelectElementProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export interface SelectValueProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  placeholder?: string;
}

// Popover Component Types
export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface PopoverTriggerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  asChild?: boolean;
}

// Skeleton Component Types
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// Chart Component Types
export interface DataPoint {
  [key: string]: string | number;
}

export interface BarChartComponentProps {
  title: string;
  subtitle: string;
  data: DataPoint[];
  loading?: boolean;
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
  stacked?: boolean;
  stackedKeys?: string[];
}

export interface LineChartComponentProps {
  title: string;
  subtitle: string;
  data: DataPoint[];
  loading?: boolean;
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
}

export interface PieChartComponentProps {
  title: string;
  data: DataPoint[];
  loading?: boolean;
  donut?: boolean;
  showPercentage?: boolean;
  height?: number;
}

// Analytics Filters Types
export interface FilterData {
  date: Date;
  period: string;
}

export interface AnalyticsFiltersProps {
  onFilterChange: (filters: FilterData) => void;
  onRefresh: () => void;
  onExport: () => void;
}
