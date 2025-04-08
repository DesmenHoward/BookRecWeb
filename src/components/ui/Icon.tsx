import { LucideIcon } from 'lucide-react';
import { CSSProperties } from 'react';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ icon: IconComponent, size = 24, color, className, style }: IconProps) {
  return (
    <IconComponent
      size={size}
      style={{ color, ...style }}
      className={className}
    />
  );
}
