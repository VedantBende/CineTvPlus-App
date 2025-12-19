import { ClerkProvider } from '@clerk/clerk-react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import router from './router';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/login"
      signUpUrl="/register"
    >
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
