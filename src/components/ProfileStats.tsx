import { useBookStore } from '../store/bookStore';

interface ProfileStatsProps {
  onPressStats: (statType: 'swiped' | 'favorites' | 'recommendations') => void;
}

export default function ProfileStats({ onPressStats }: ProfileStatsProps) {
  const { swipedBooks, favorites, recommendations } = useBookStore();
  
  return (
    <div className="flex flex-row justify-between items-center p-4 bg-surface rounded-lg shadow-sm">
      <button 
        className="flex flex-col items-center flex-1 cursor-pointer hover:opacity-80"
        onClick={() => onPressStats('swiped')}
      >
        <span className="text-2xl font-bold text-accent">{swipedBooks.length}</span>
        <span className="text-sm text-textLight text-center">Books{'\n'}Swiped</span>
      </button>
      
      <div className="w-px h-12 bg-border mx-4" />
      
      <button 
        className="flex flex-col items-center flex-1 cursor-pointer hover:opacity-80"
        onClick={() => onPressStats('favorites')}
      >
        <span className="text-2xl font-bold text-accent">{favorites.length}</span>
        <span className="text-sm text-textLight">Favorites</span>
      </button>
      
      <div className="w-px h-12 bg-border mx-4" />
      
      <button 
        className="flex flex-col items-center flex-1 cursor-pointer hover:opacity-80"
        onClick={() => onPressStats('recommendations')}
      >
        <span className="text-2xl font-bold text-accent">{recommendations.length}</span>
        <span className="text-sm text-textLight">Recommendations</span>
      </button>
    </div>
  );
}