import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getContinueWatchingList, removeItem } from '../../utils/continueWatchingStore';
import ContentRow from './ContentRow';
import ContinueWatchingCard from './ContinueWatchingCard';

function ContinueWatching() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const list = getContinueWatchingList();
    setItems(list);
  }, [location.pathname]);

  const handleRemove = (id) => {
    removeItem(id);
    setItems(getContinueWatchingList());
  };

  const handleContinueWatching = (item) => {
    const params = new URLSearchParams({
      id: item.id,
      type: item.type
    });

    if (item.season && item.episode) {
      params.append('season', item.season);
      params.append('episode', item.episode);
    }

    navigate(`/watch?${params.toString()}`);
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ContentRow title="Continue Watching" icon="play_arrow">
      {items.map((item, index) => (
        <div 
          key={`${item.id}-${index}`}
          className="flex-shrink-0 snap-start w-[75vw] xs:w-[60vw] sm:w-[45vw] md:w-[32vw] lg:w-[26vw] xl:w-[22vw] transition-transform duration-300 ease-out"
        >
          <ContinueWatchingCard
            tmdbId={item.id}
            title={item.title}
            backdrop={item.backdrop_path || item.poster_path}
            type={item.type}
            season={item.season}
            episode={item.episode}
            onRemove={handleRemove}
            onClick={() => handleContinueWatching(item)}
          />
        </div>
      ))}
    </ContentRow>
  );
}

export default ContinueWatching;
