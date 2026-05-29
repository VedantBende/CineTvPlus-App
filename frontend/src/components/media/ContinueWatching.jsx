import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { fetchContinueWatchingList, removeItem } from '../../utils/continueWatchingStore';
import ContentRow from './ContentRow';
import ContinueWatchingCard from './ContinueWatchingCard';

function ContinueWatching() {
  const [items, setItems] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken, isSignedIn } = useAuth();

  // Fetch from DB on mount and on route change
  useEffect(() => {
    let cancelled = false;

    const loadItems = async () => {
      if (!isSignedIn) {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const list = await fetchContinueWatchingList(getToken);
      if (!cancelled) {
        setItems(list);
        setIsVisible(list.length > 0);
        setLoading(false);
      }
    };

    loadItems();

    return () => { cancelled = true; };
  }, [location.pathname, isSignedIn, getToken]);

  // Optimistic remove with revert on failure
  const handleRemove = useCallback(async (id) => {
    const previousItems = [...items];
    const updatedItems = items.filter(item => String(item.mediaId) !== String(id));

    // Optimistic: remove from UI instantly
    setItems(updatedItems);

    // If this was the last item, trigger fade-out
    if (updatedItems.length === 0) {
      // Small delay to let CSS transition play before unmounting
      setTimeout(() => setIsVisible(false), 300);
    }

    try {
      await removeItem(getToken, id);
    } catch {
      // Revert on failure
      setItems(previousItems);
      setIsVisible(true);
    }
  }, [items, getToken]);

  const handleContinueWatching = (item) => {
    const params = new URLSearchParams({
      id: item.mediaId,
      type: item.mediaType
    });

    if (item.season && item.episode) {
      params.append('season', item.season);
      params.append('episode', item.episode);
    }

    navigate(`/watch?${params.toString()}`);
  };

  // Don't render anything while loading or if no items and not visible
  if (loading || (!isVisible && items.length === 0)) {
    return null;
  }

  if (items.length === 0 && !isVisible) {
    return null;
  }

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        items.length === 0 ? 'opacity-0 scale-y-95 max-h-0 overflow-hidden' : 'opacity-100 scale-y-100 max-h-[500px]'
      }`}
    >
      <ContentRow title="Continue Watching" icon="play_arrow">
        {items.map((item, index) => (
          <div 
            key={`${item.mediaId}-${index}`}
            className="flex-shrink-0 snap-start w-[75vw] xs:w-[60vw] sm:w-[45vw] md:w-[32vw] lg:w-[26vw] xl:w-[22vw] transition-transform duration-300 ease-out"
          >
            <ContinueWatchingCard
              tmdbId={item.mediaId}
              title={item.title}
              backdrop={item.backdropPath || item.posterPath}
              type={item.mediaType}
              season={item.season}
              episode={item.episode}
              onRemove={handleRemove}
              onClick={() => handleContinueWatching(item)}
            />
          </div>
        ))}
      </ContentRow>
    </div>
  );
}

export default ContinueWatching;
