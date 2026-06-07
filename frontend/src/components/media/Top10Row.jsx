import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

function Top10Card({ item, index, type }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const mediaType = item.media_type || type || 'movie';

  const handleClick = () => {
    const routeType = mediaType === 'anime' ? 'tv' : mediaType;
    navigate(`/${routeType}/${item.tmdbId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative flex-shrink-0 snap-start w-32 xs:w-40 sm:w-48 group cursor-pointer transition-transform duration-300"
    >
      {/* Rank Number - Outline Style */}
      <div
        className="absolute -left-2 xs:-left-4 sm:-left-6 lg:-left-8 bottom-0 sm:-bottom-2 z-20 text-[80px] xs:text-[100px] sm:text-[130px] md:text-[160px] font-black leading-none pointer-events-none opacity-90 transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105 group-hover:text-accent-red group-hover:opacity-100"
        style={{
          WebkitTextStroke: '2px #E50914',
          color: 'transparent',
          fontFamily: '"Lexend", sans-serif'
        }}
        // In order to transition the color from transparent to solid, we use Tailwind classes,
        // but since inline `color: 'transparent'` takes precedence, we'll assign it via a conditional class 
        // to let hover:text-accent-red take effect.
        aria-hidden="true"
      >
        {/* We use a span so we can apply the transparent text color that gets overridden on hover */}
        <span className="text-transparent group-hover:text-accent-red transition">
          {index + 1}
        </span>
      </div>

      {/* Poster Image */}
      <div className="relative z-10 group-hover:z-30 w-full aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-xl ml-6 xs:ml-8 sm:ml-12 border border-transparent group-hover:border-white/20">
        {!imageError && (item.url || item.poster) ? (
          <img
            src={item.url || item.poster}
            alt={item.title || item.name}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <span className="text-gray-600 dark:text-gray-400 text-xs text-center px-2">{item.title || item.name}</span>
          </div>
        )}
        
        {/* Hover Overlay - Consistent Dark Cinematic Effect */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex flex-col items-center justify-center p-3 text-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <button className="bg-white hover:bg-gray-200 text-black rounded-full p-2 xs:p-3 mb-2 transition-all hover:scale-110 shadow-xl">
              <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <h3 className="text-white text-xs sm:text-sm font-bold line-clamp-2 md:line-clamp-3 mb-1 transition">{item.title || item.name}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

function Top10Row({ items, title = "TOP 10", subtitle = "CONTENT TODAY", type = "movie" }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { isAnimeMode } = useTheme();

  // Take only top 10
  const top10Items = useMemo(() => {
    if (!items) return [];
    return items.slice(0, 10);
  }, [items]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      clearTimeout(timer);
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Smooth Native Scrolling logic for Top 10 rows (no infinite loops)
    const scrollAmount = el.clientWidth * 0.8;
    
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!top10Items.length) return null;

  const displaySubtitle = isAnimeMode ? "CONTENT TODAY" : subtitle;

  return (
    <section className="space-y-4 sm:space-y-6 md:space-y-8 my-8 sm:my-10 lg:my-16">
      {/* Title Area */}
      <div className="flex items-end gap-3 px-1">
        <h2 className="text-transparent font-black text-5xl sm:text-5xl md:text-8xl tracking-tight leading-none" style={{ WebkitTextStroke: '1px #E50914' }}>
          {title}
        </h2>
        <div className="flex flex-col text-gray-900 dark:text-white font-bold text-xs sm:text-sm tracking-widest leading-none pb-1 transition">
          <span>{displaySubtitle.split(' ')[0]}</span>
          <span>{displaySubtitle.split(' ').slice(1).join(' ')}</span>
        </div>
      </div>

      {/* Scrollable Row */}
      <div className="group/row relative mt-6 sm:mt-8 pt-4">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={`hidden lg:flex absolute left-0 top-0 bottom-0 w-20 z-20 items-center justify-center fade-edge-left transition-all duration-500 ease-out ${
            !canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:w-24'
          }`}
          aria-label="Scroll left"
        >
          <div className="bg-white/70 dark:bg-black/60 hover:bg-gray-100 dark:hover:bg-black p-2.5 rounded-full transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-white/10 shadow-md">
            <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={`hidden lg:flex absolute right-0 top-0 bottom-0 w-20 z-20 items-center justify-center fade-edge-right transition-all duration-500 ease-out ${
            !canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:w-24'
          }`}
          aria-label="Scroll right"
        >
          <div className="bg-white/70 dark:bg-black/60 hover:bg-gray-100 dark:hover:bg-black p-2.5 rounded-full transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-white/10 shadow-md">
            <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Content */}
        <div
          ref={scrollRef}
          className="flex gap-8 xs:gap-12 sm:gap-16 lg:gap-20 overflow-x-auto overflow-y-visible no-scrollbar scroll-smooth snap-x snap-mandatory py-6 -my-6 px-4 sm:px-8"
          style={{ scrollPaddingLeft: '2rem', scrollPaddingRight: '1rem' }}
        >
          {top10Items.map((item, index) => (
            <Top10Card key={item.tmdbId} item={item} index={index} type={type} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Top10Row;
