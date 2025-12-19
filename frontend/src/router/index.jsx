import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import MoviesPage from '../pages/MoviesPage';
import TVShowsPage from '../pages/TVShowsPage';
import SearchPage from '../pages/SearchPage';
import MovieDetails from '../pages/MovieDetails';
import TVDetails from '../pages/TVDetails';
import WatchPage from '../pages/WatchPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import FavoritesPage from '../pages/FavoritesPage';
import SettingsPage from '../pages/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <Navigate to="/" replace />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'movies',
        element: <MoviesPage />
      },
      {
        path: 'tv',
        element: <TVShowsPage />
      },
      {
        path: 'search',
        element: <SearchPage />
      },
      {
        path: 'movie/:id',
        element: <MovieDetails />
      },
      {
        path: 'tv/:id',
        element: <TVDetails />
      },
      {
        path: 'watch',
        element: <WatchPage />
      },
      {
        path: 'favorites',
        element: <FavoritesPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  },
  // Clerk authentication routes with wildcards
  {
    path: '/login',
    element: <Login />,
    children: [
      {
        path: '*',
        element: <Login />
      }
    ]
  },
  {
    path: '/register',
    element: <Register />,
    children: [
      {
        path: '*',
        element: <Register />
      }
    ]
  },
  // Catch-all route
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default router;
