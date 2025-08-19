import React from 'react';
import { SelectProps, SelectItemProps, SelectElementProps, SelectValueProps } from '@/types/ui';

export const Select: React.FC<SelectProps> = ({ children, onValueChange, ...props }) => (
  <select onChange={(e) => onValueChange && onValueChange(e.target.value)} {...props}>{children}</select>
);

export const SelectTrigger: React.FC<SelectElementProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const SelectValue: React.FC<SelectValueProps> = ({ children, placeholder, ...props }) => (
  <span {...props}>{children || placeholder}</span>
);

export const SelectContent: React.FC<SelectElementProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const SelectItem: React.FC<SelectItemProps> = ({ children, value, ...props }) => (
  <option value={value} {...props}>{children}</option>
);
