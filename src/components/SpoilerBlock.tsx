import React, { useState } from 'react';
import { TriangleAlert, Eye } from 'lucide-react';

// Theme colors
const THEME = {
  primary: '#7D6E83',
  accent: '#A75D5D',
  background: '#F9F5EB',
  surface: '#EFE3D0',
  text: '#4F4557',
  textLight: '#7D6E83',
  border: '#D0B8A8',
  info: '#6B9080',
  warning: '#DDA15E',
  error: '#BC6C25'
};

interface SpoilerBlockProps {
  content: React.ReactNode;
  warningText?: string;
  spoilerType?: 'plot' | 'ending' | 'sensitive' | 'general';
  blurIntensity?: number;
}

export default function SpoilerBlock({ 
  content, 
  warningText = 'Spoiler Content',
  spoilerType = 'general',
  blurIntensity = 5
}: SpoilerBlockProps) {
  const [revealed, setRevealed] = useState(false);
  
  const toggleReveal = () => {
    setRevealed(!revealed);
  };

  const getSpoilerTypeInfo = () => {
    switch (spoilerType) {
      case 'plot':
        return {
          color: THEME.warning,
          text: 'Plot Spoiler',
          icon: <TriangleAlert size={20} style={{ color: THEME.warning }} />
        };
      case 'ending':
        return {
          color: THEME.error,
          text: 'Ending Spoiler',
          icon: <TriangleAlert size={20} style={{ color: THEME.error }} />
        };
      case 'sensitive':
        return {
          color: THEME.primary,
          text: 'Sensitive Content',
          icon: <TriangleAlert size={20} style={{ color: THEME.primary }} />
        };
      case 'general':
      default:
        return {
          color: THEME.info,
          text: 'Spoiler',
          icon: <TriangleAlert size={20} style={{ color: THEME.info }} />
        };
    }
  };

  const typeInfo = getSpoilerTypeInfo();

  return (
    <div className="my-2.5 rounded-lg overflow-hidden">
      <button
        onClick={toggleReveal}
        className={`
          w-full p-3 flex items-center justify-between
          ${revealed ? 'bg-gray-100' : 'bg-gray-50'}
          hover:bg-gray-100 transition-colors
          border-b border-gray-200
        `}
      >
        <div className="flex items-center space-x-2">
          {typeInfo.icon}
          <span className="text-sm font-medium" style={{ color: typeInfo.color }}>
            {typeInfo.text}
          </span>
          <span className="text-sm font-medium" style={{ color: THEME.text }}>
            {warningText}
          </span>
        </div>
        <Eye size={20} style={{ color: THEME.textLight }} />
      </button>
      
      <div 
        className={`
          p-4 bg-white
          ${revealed ? '' : 'blur-sm'}
          transition-all duration-300
        `}
        style={{ filter: revealed ? 'none' : `blur(${blurIntensity}px)` }}
      >
        {content}
      </div>
    </div>
  );
}