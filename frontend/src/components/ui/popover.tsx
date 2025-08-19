import React from 'react';
import { PopoverProps, PopoverTriggerProps } from '@/types/ui';

export const Popover: React.FC<PopoverProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const PopoverContent: React.FC<PopoverProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
