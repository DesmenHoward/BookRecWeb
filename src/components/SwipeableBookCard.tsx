import { useState } from 'react';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Book } from '../types/book';
import { Heart, X } from 'lucide-react';
import BookDescriptionModal from './BookDescriptionModal';

interface SwipeableBookCardProps {
  book: Book;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeableBookCard({ book, onSwipe }: SwipeableBookCardProps) {
  const [gone] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [props, api] = useSprings(1, i => ({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    config: { friction: 50, tension: 500 }
  }));

  const bind = useDrag(({ 
    down, 
    movement: [mx], 
    direction: [xDir], 
    velocity,
    cancel 
  }) => {
    const trigger = velocity > 0.2;
    const dir = xDir < 0 ? -1 : 1;

    if (!down && trigger) {
      onSwipe(dir === 1 ? 'right' : 'left');
      cancel();
    }

    api.start(() => {
      const isGone = !down && trigger;
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
      const rotation = mx / 100 + (isGone ? dir * 10 * velocity : 0);
      const scale = down ? 1.1 : 1;
      return {
        x,
        rotation,
        scale,
        immediate: down,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 }
      };
    });
  });

  if (gone) return null;

  return (
    <>
      {props.map((style, i) => (
        <animated.div
          key={i}
          {...bind()}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            willChange: 'transform',
            transform: style.x.to(x => `translate3d(${x}px,0,0) rotate(${style.rotation.get()}deg)`),
            touchAction: 'none'
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          <div className="relative w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <img
              src={book.coverImages.large}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                // Try medium size if large fails
                if (img.src === book.coverImages.large) {
                  img.src = book.coverImages.medium;
                }
                // Try small size if medium fails
                else if (img.src === book.coverImages.medium) {
                  img.src = book.coverImages.small;
                }
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{book.title}</h3>
              <p className="text-lg mb-3">by {book.author}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {book.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <div>
                <p className="text-sm line-clamp-3 text-white/90 mb-2">
                  {book.description}
                </p>
                <button
                  onClick={() => setShowDescription(true)}
                  className="text-sm text-accent underline hover:text-accent/80 transition-colors"
                >
                  Read More
                </button>
              </div>
            </div>
          </div>
        </animated.div>
      ))}

      <BookDescriptionModal
        isOpen={showDescription}
        onClose={() => setShowDescription(false)}
        title={book.title}
        author={book.author}
        description={book.description}
      />
    </>
  );
}