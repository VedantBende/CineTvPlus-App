import { useUser, SignOutButton } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AccessBlocker = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();
  const { user: mongoUser, isSyncing, syncError } = useAuthStore();

  if (!isLoaded) return null; // Let Clerk handle initial load
  
  if (!isSignedIn) {
    // For unauthenticated users, the root entry and protected routes always redirect to the Welcome Gate
    // They can then proceed to login or register from there.
    return <Navigate to="/welcome" replace />;
  }

  // Handle Syncing State
  if (isSignedIn && isSyncing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-medium">Syncing profile...</h2>
        <p className="text-gray-400 mt-2">Connecting with the servers...</p>
      </div>
    );
  }

  // Handle Sync Error
  if (isSignedIn && !mongoUser && syncError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-white px-4 text-center">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-md w-full">
          <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Sync Failed</h2>
          <p className="text-gray-400 mb-6 text-sm">
            We are having trouble connecting to the servers. Please try again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] mb-4"
          >
            Retry Connection
          </button>
          <p className="text-zinc-500 text-xs">If this continues, please try again later.</p>
        </div>
      </div>
    );
  }

  // Fallback for missing user but no error/sync (shouldn't happen with robustness)
  if (isSignedIn && !mongoUser) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
          <p>Initializing...</p>
        </div>
     );
  }

  // Admin always gets access
  if (mongoUser.role === 'admin') {
    return children;
  }

  if (mongoUser.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white px-4 text-center mt-12">
        <div className="bg-black/60 border border-zinc-800 p-8 rounded-lg max-w-md w-full backdrop-blur-sm">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h2 className="text-2xl font-bold mb-2">Approval Pending</h2>
          <p className="text-gray-400 mb-6">Your account is currently pending approval by an administrator. You will gain access once approved.</p>
          <SignOutButton>
             <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition">Sign Out</button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  if (mongoUser.status === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white px-4 text-center mt-12">
        <div className="bg-black/60 border border-zinc-800 p-8 rounded-lg max-w-md w-full backdrop-blur-sm">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">Your account request has been rejected.</p>
          <SignOutButton>
             <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition">Sign Out</button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  if (mongoUser.status === 'revoked') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white px-4 text-center mt-12">
        <div className="bg-black/60 border border-zinc-800 p-8 rounded-lg max-w-md w-full backdrop-blur-sm">
          <svg className="w-16 h-16 text-orange-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <h2 className="text-2xl font-bold mb-2 text-orange-400">Access Revoked</h2>
          <p className="text-gray-400 mb-6 font-medium">Your account access has been revoked by an administrator.</p>
          <div className="text-xs text-zinc-500 mb-6 italic">Contact support if you believe this is an error.</div>
          <SignOutButton>
             <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-6 rounded transition border border-zinc-700">Sign Out</button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  // Approved
  return children;
};

export default AccessBlocker;
