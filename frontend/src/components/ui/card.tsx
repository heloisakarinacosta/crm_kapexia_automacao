import React from 'react';
import { CardProps } from '@/types/ui';

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ className, children, ...props }) => (
  <h3 className={className} {...props}>{children}</h3>
);

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);
