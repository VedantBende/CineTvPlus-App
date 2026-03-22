import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AccessBlocker from '../components/common/AccessBlocker';

function MainLayout() {
  return (
    <div className="min-h-screen bg-netflix-black flex flex-col">
      <Navbar />
      <AccessBlocker>
        <main className="flex-1">
          <Outlet />
        </main>
      </AccessBlocker>
      <Footer />
    </div>
  );
}

export default MainLayout;
