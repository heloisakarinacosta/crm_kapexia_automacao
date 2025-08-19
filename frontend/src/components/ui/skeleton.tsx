import React from 'react';
import { SkeletonProps } from '@/types/ui';

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => (
  <div className={className || 'bg-gray-200 animate-pulse rounded'} {...props} />
);
