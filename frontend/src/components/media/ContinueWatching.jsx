import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { fetchContinueWatchingList, removeItem, touchItem } from '../../utils/continueWatchingStore';
import { removeSavedPlayer } from '../../utils/playerConfig';
import { useTheme } from '../../context/ThemeContext';
import ContentRow from './ContentRow';
import ContinueWatchingCard from './ContinueWatchingCard';

function ContinueWatching({ filterType }) {
  const [items, setItems] = useState([]);
  const [isVisible, setIsVisible] = useState(false); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken, isSignedIn } = useAuth();
  const { isAnimeMode } = useTheme();
  // Tracks the id of the item just clicked so we can promote it on re-fetch
  const lastClickedIdRef = useRef(null);

  // Fetch from DB on mount and after every navigation (including returning from /watch)
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

      const list = await fetchContinueWatchingList(getToken, isAnimeMode);
      if (!cancelled) {
        
        let filteredList = list;
        if (filterType === 'movie') {
          filteredList = list.filter(item => isAnimeMode ? !item.season : item.mediaType === 'movie');
        } else if (filterType === 'tv') {
          filteredList = list.filter(item => isAnimeMode ? !!item.season : item.mediaType === 'tv');
        }

        if (lastClickedIdRef.current) {
          const clickedId = String(lastClickedIdRef.current);
          const clickedIndex = filteredList.findIndex(i => String(i.mediaId) === clickedId);
          if (clickedIndex > 0) {
            const promoted = filteredList.splice(clickedIndex, 1)[0];
            filteredList.unshift(promoted);
          }
          lastClickedIdRef.current = null;
        }
        setItems(filteredList);
        setIsVisible(filteredList.length > 0);
        setLoading(false);
      }
    };

    loadItems();

    return () => { cancelled = true; };
  }, [location.pathname, isSignedIn, getToken, isAnimeMode, filterType]);

  // Optimistic remove with revert on failure
  const handleRemove = useCallback(async (id) => {
    const itemToRemove = items.find(item => String(item.mediaId) === String(id));
    if (itemToRemove) {
      removeSavedPlayer(id, itemToRemove.mediaType);
    }

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
      await removeItem(getToken, id, isAnimeMode);
    } catch {
      // Revert on failure
      setItems(previousItems);
      setIsVisible(true);
    }
  }, [items, getToken, isAnimeMode]);

  const handleContinueWatching = (item) => {
    const clickedId = String(item.mediaId);

    // current before the user even finishes navigating. No race condition.
    touchItem(getToken, clickedId, isAnimeMode);

    // Optimistically move this item to the top of the list immediately
    lastClickedIdRef.current = clickedId;
    setItems(prev => {
      const idx = prev.findIndex(i => String(i.mediaId) === clickedId);
      if (idx <= 0) return prev; // already first or not found
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.unshift(moved);
      return next;
    });

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

  // While loading the very first time (no items yet), hide the row
  if (loading && items.length === 0) {
    return null;
  }

  // If we've confirmed there are no items and it's not visible, hide
  if (!loading && items.length === 0 && !isVisible) {
    return null;
  }

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        items.length === 0 ? 'opacity-0 scale-y-95 max-h-0 overflow-hidden' : 'opacity-100 scale-y-100 max-h-[500px]'
      }`}
    >
      <ContentRow title="Continue Watching" icon="play_arrow">
        {items.map((item) => (
          <div
            key={item.mediaId}
            className="flex-shrink-0 snap-start w-[75vw] xs:w-[60vw] sm:w-[45vw] md:w-[32vw] lg:w-[26vw] xl:w-[22vw] transition-transform duration-300 ease-out"
          >
            <ContinueWatchingCard
              mediaId={item.mediaId}
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
