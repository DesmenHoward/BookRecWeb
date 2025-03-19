import React from 'react';
import { Path, Svg } from 'react-native-svg';

interface XIconProps {
  size?: number;
  color?: string;
}

export default function XIcon({ size = 20, color = '#000000' }: XIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.1761 4H19.9362L13.9061 10.7774L21 20H15.4456L11.0951 14.4066L6.11723 20H3.35544L9.76604 12.7927L3 4H8.69545L12.6279 9.11362L17.1761 4ZM16.1399 18.4H17.6899L7.97293 5.5H6.31792L16.1399 18.4Z"
        fill={color}
      />
    </Svg>
  );
}