import { useState } from 'react';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Book } from '../types/book';
import BookDescriptionModal from './BookDescriptionModal';
import ShopButton from './ShopButton';

interface SwipeableBookCardProps {
  book: Book;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeableBookCard({ book, onSwipe }: SwipeableBookCardProps) {
  const [gone] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [props, api] = useSprings(1, () => ({
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
    velocity: [vx],
    cancel 
  }) => {
    const trigger = Math.abs(vx) > 0.2;
    const dir = xDir < 0 ? -1 : 1;

    if (!down && trigger) {
      onSwipe(dir === 1 ? 'right' : 'left');
      cancel();
    }

    api.start(() => {
      const isGone = !down && trigger;
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
      const rotation = (mx as number) / 100 + (isGone ? dir * 10 * vx : 0);
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
            touchAction: 'none',
            perspective: '2000px'
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          <div className="relative w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden group">
            {/* Book spine shadow effect */}
            <div
              className="absolute inset-y-0 left-0 w-8 rounded-l-2xl transition-all duration-300 group-hover:shadow-2xl"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)',
                transform: 'translateZ(2px) translateX(-2px)',
                transformStyle: 'preserve-3d'
              }}
            />
            <div 
              className="w-full h-full transition-transform duration-300 transform group-hover:-translate-y-4 group-hover:rotate-2"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateZ(0)',
                transformOrigin: 'left center',
                boxShadow: '12px 12px 30px rgba(0,0,0,0.5), -5px 0 15px rgba(0,0,0,0.2)'
              }}
            >
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
              
              {/* Page effect */}
              <div
                className="absolute inset-y-0 right-0 w-2 rounded-r-2xl bg-gray-100 transition-all duration-300"
                style={{
                  transform: 'translateZ(1px) translateX(-1px) rotateY(-20deg)',
                  transformStyle: 'preserve-3d',
                  boxShadow: '2px 0 3px rgba(0,0,0,0.1)'
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{book.title}</h3>
                <p className="text-lg mb-3 drop-shadow-lg">by {book.author}</p>
                
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
                
                <div className="mb-4">
                  <p className="text-sm line-clamp-3 text-white/90 mb-2">
                    {book.description}
                  </p>
                  <button
                    onClick={() => setShowDescription(true)}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Read More
                  </button>
                </div>

                <div className="flex justify-center">
                  <ShopButton book={book} variant="light" />
                </div>
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