import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AccessBlocker from '../components/common/AccessBlocker';
import Loader from '../components/ui/Loader';

function MainLayout() {
  return (
    <div className="min-h-screen bg-netflix-black flex flex-col">
      <Navbar />
      <AccessBlocker>
        <main className="flex-1">
          <Suspense fallback={
            <div className="flex h-[50vh] items-center justify-center">
              <Loader size="lg" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </AccessBlocker>
      <Footer />
    </div>
  );
}

export default MainLayout;
