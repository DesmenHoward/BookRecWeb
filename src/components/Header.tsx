import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  rightComponent?: React.ReactNode;
}

export default function Header({ 
  title, 
  showBackButton = false, 
  showSearch = true,
  rightComponent 
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
      <div className="flex items-center w-1/3">
        {showBackButton && (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
        )}
      </div>
      
      <h1 className="text-xl font-semibold text-center flex-1">{title}</h1>
      
      <div className="flex items-center justify-end w-1/3">
        {rightComponent ? (
          rightComponent
        ) : showSearch ? (
          <button 
            onClick={() => navigate('/search')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Search size={24} className="text-gray-700" />
          </button>
        ) : null}
      </div>
    </header>
  );
}