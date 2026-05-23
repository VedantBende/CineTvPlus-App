import { useRef, useState, useEffect } from 'react';

function ContentRow({ title, icon, children, className = '' }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    // Delay initial check to let items render
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
  }, [children]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    
    // Utilize native smooth scrolling for better hardware-accelerated performance
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section className={`space-y-3 sm:space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-gray-900 dark:text-white text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold flex items-center transition">
          <span className="w-1.5 h-5 xs:h-6 sm:h-7 md:h-8 bg-netflix-red mr-2 sm:mr-3 rounded-full"></span>
          {title}
        </h2>
      </div>

      {/* Scrollable Row */}
      <div className="group/row relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={`hidden lg:flex absolute left-0 top-0 bottom-0 w-14 z-20 items-center justify-center bg-gradient-to-r from-white dark:from-netflix-black/90 to-transparent transition-all duration-500 ease-out ${
            canScrollLeft ? 'opacity-0 group-hover/row:opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <div className="bg-white/70 dark:bg-black/60 hover:bg-gray-100 dark:hover:bg-black/90 p-2.5 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-md">
            <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={`hidden lg:flex absolute right-0 top-0 bottom-0 w-14 z-20 items-center justify-center bg-gradient-to-l from-white dark:from-netflix-black/90 to-transparent transition-all duration-500 ease-out ${
            canScrollRight ? 'opacity-0 group-hover/row:opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <div className="bg-white/70 dark:bg-black/60 hover:bg-gray-100 dark:hover:bg-black/90 p-2.5 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-md">
            <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Content */}
        <div
          ref={scrollRef}
          className="flex gap-2 xs:gap-3 sm:gap-4 overflow-x-auto overflow-y-visible no-scrollbar snap-x snap-mandatory py-4 -my-4"
          style={{ scrollPaddingLeft: '4px', scrollPaddingRight: '4px' }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

// Wrapper for individual items in the row
export function ContentRowItem({ children, className = '' }) {
  return (
    <div className={`flex-shrink-0 snap-start w-[42vw] xs:w-[30vw] sm:w-[28vw] md:w-[22vw] lg:w-[17vw] xl:w-[14vw] transition-transform duration-300 ease-out ${className}`}>
      {children}
    </div>
  );
}

export default ContentRow;
