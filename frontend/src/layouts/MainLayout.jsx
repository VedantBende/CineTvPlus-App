import { useLocation, useOutlet } from 'react-router-dom';
import { Suspense, useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AccessBlocker from '../components/common/AccessBlocker';
import PageSkeleton from '../components/ui/PageSkeleton';


function MainLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const [backgroundOutlet, setBackgroundOutlet] = useState(null);

  const isSettings = location.pathname.includes('/settings');

  useEffect(() => {
    if (!isSettings) {
      setBackgroundOutlet(currentOutlet);
    }
  }, [location.pathname, currentOutlet, isSettings]);

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col">
      <Navbar />
      <AccessBlocker>
        <main className="flex-1">
          <Suspense fallback={<PageSkeleton type="home" />}>
            {/* Position 1: The main route (WatchPage/HomePage). Wrapped in a div so it doesn't unmount when display changes. */}
            <div style={{ display: isSettings ? 'none' : 'block' }}>
              {isSettings ? backgroundOutlet : currentOutlet}
            </div>
            
            {/* Position 2: The Settings page. Renders normally within <main> so Navbar remains visible above it. */}
            {isSettings ? currentOutlet : null}
          </Suspense>
        </main>
      </AccessBlocker>
      <Footer />
    </div>
  );
}

export default MainLayout;
