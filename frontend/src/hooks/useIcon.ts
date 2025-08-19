import { useMemo } from 'react';
import { CRMIcons } from '../utils/iconMap';
import { IconTheme } from '../styles/iconTheme';

interface UseIconProps {
  name: keyof typeof CRMIcons;
  context?: keyof typeof IconTheme.contexts;
  size?: keyof typeof IconTheme.sizes | number;
  color?: keyof typeof IconTheme.colors | string;
  active?: boolean;
}

export const useIcon = ({
  name,
  context,
  size,
  color,
  active = false
}: UseIconProps) => {
  const iconConfig = useMemo(() => {
    const path = CRMIcons[name];
    
    // Determinar tamanho
    let iconSize: number;
    if (typeof size === 'number') {
      iconSize = size;
    } else if (size && IconTheme.sizes[size]) {
      iconSize = IconTheme.sizes[size];
    } else if (context && IconTheme.contexts[context]) {
      iconSize = IconTheme.contexts[context].size;
    } else {
      iconSize = IconTheme.sizes.md;
    }
    
    // Determinar cor
    let iconColor: string;
    if (color && IconTheme.colors[color as keyof typeof IconTheme.colors]) {
      iconColor = IconTheme.colors[color as keyof typeof IconTheme.colors];
    } else if (typeof color === 'string' && color.startsWith('#')) {
      iconColor = color;
    } else if (context && IconTheme.contexts[context]) {
      const contextConfig = IconTheme.contexts[context];
      iconColor = active && 'activeColor' in contextConfig
        ? contextConfig.activeColor!
        : ('color' in contextConfig ? contextConfig.color! : 'currentColor');
    } else {
      iconColor = 'currentColor';
    }
    
    return {
      path,
      size: iconSize,
      color: iconColor
    };
  }, [name, context, size, color, active]);
  
  return iconConfig;
};

export default useIcon;

