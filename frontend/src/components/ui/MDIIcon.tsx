import React from 'react';
import Icon from '@mdi/react';

interface MDIIconProps {
  path: string;
  size?: number | string;
  color?: string;
  className?: string;
  onClick?: () => void;
  title?: string;
  spin?: boolean;
  rotate?: number;
}

export const MDIIcon: React.FC<MDIIconProps> = ({
  path,
  size = 1,
  color = 'currentColor',
  className = '',
  onClick,
  title,
  spin = false,
  rotate = 0
}) => {
  const iconStyle = {
    cursor: onClick ? 'pointer' : 'default',
    transform: rotate ? `rotate(${rotate}deg)` : undefined,
    animation: spin ? 'spin 1s linear infinite' : undefined
  };

  return (
    <span onClick={onClick} style={{ display: 'inline-flex', ...iconStyle }} title={title} className={className}>
      <Icon
        path={path}
        size={size}
        color={color}
      />
    </span>
  );
};

export default MDIIcon;

