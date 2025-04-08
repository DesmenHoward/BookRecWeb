import { useState } from 'react';
import { Clock, TrendingUp, Calendar, BookOpen, BarChart } from 'lucide-react';
import { useReadingStore } from '@/store/readingStore';

export default function ReadingAnalytics() {
  const { 
    booksRead,
    pagesRead,
    readingStreak,
    averageRating,
    timeSpentReading,
    addReadingTime
  } = useReadingStore();

  const [isTracking, setIsTracking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const handleStartTracking = () => {
    setIsTracking(true);
    setSessionStartTime(new Date());
  };

  const handleStopTracking = () => {
    if (sessionStartTime) {
      const endTime = new Date();
      const durationInMinutes = Math.round((endTime.getTime() - sessionStartTime.getTime()) / (1000 * 60));
      addReadingTime(durationInMinutes);
    }
    setIsTracking(false);
    setSessionStartTime(null);
  };

  return (
    <div className="bg-surface rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reading Analytics</h2>
        <button
          onClick={isTracking ? handleStopTracking : handleStartTracking}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isTracking
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isTracking ? 'Stop Reading' : 'Start Reading'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface-light p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <BookOpen className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium">Books Read</span>
          </div>
          <p className="text-2xl font-bold">{booksRead}</p>
        </div>

        <div className="bg-surface-light p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <BarChart className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm font-medium">Pages Read</span>
          </div>
          <p className="text-2xl font-bold">{pagesRead}</p>
        </div>

        <div className="bg-surface-light p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium">Reading Streak</span>
          </div>
          <p className="text-2xl font-bold">{readingStreak} days</p>
        </div>

        <div className="bg-surface-light p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium">Average Rating</span>
          </div>
          <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
        </div>

        <div className="bg-surface-light p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-indigo-500 mr-2" />
            <span className="text-sm font-medium">Time Reading</span>
          </div>
          <p className="text-2xl font-bold">{Math.round(timeSpentReading / 60)} hours</p>
        </div>
      </div>
    </div>
  );
};