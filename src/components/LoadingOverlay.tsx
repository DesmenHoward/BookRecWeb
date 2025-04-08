import React from 'react';
import { BookOpen } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  showSpinner?: boolean;
  transparent?: boolean;
}

export default function LoadingOverlay({ 
  message = 'Loading...', 
  showSpinner = true,
  transparent = false
}: LoadingOverlayProps) {
  return (
    <div className={`
      fixed inset-0 flex flex-col items-center justify-center z-50
      ${transparent ? 'bg-black/30' : 'bg-white'}
    `}>
      {showSpinner && (
        <div className="relative mb-4">
          <BookOpen 
            size={32} 
            className="text-accent animate-[spin_2s_linear_infinite]"
          />
          <div className="absolute inset-0 animate-[pulse_2s_ease-in-out_infinite]">
            <BookOpen 
              size={32} 
              className="text-accent opacity-50"
            />
          </div>
        </div>
      )}
      
      <p className={`
        text-lg font-medium
        ${transparent ? 'text-white' : 'text-gray-700'}
      `}>
        {message}
      </p>
    </div>
  );
}