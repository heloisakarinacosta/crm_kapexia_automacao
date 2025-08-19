import React from 'react';
import { ButtonProps } from '@/types/ui';

export const Button: React.FC<ButtonProps> = ({ children, variant, size, ...props }) => (
  <button className={`${variant ? `btn-${variant}` : ''} ${size ? `btn-${size}` : ''}`} {...props}>{children}</button>
);
