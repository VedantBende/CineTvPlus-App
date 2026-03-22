import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const PublicGate = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();
  const hasVisited = localStorage.getItem('hasVisited');

  if (!isLoaded) return null;

  // If already signed in, go to home
  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // If not visited yet, show the gate
  if (!hasVisited) {
    return <Navigate to="/welcome" replace />;
  }

  // Otherwise, show the login/register page
  return children;
};

export default PublicGate;
