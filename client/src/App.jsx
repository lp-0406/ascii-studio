import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Generator from './pages/Generator.jsx';
import MyArtworks from './pages/MyArtworks.jsx';
import ArtworkDetails from './pages/ArtworkDetails.jsx';
import Profile from './pages/Profile.jsx';
import SharedArtwork from './pages/SharedArtwork.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/share/:token" element={<SharedArtwork />} />

      <Route
        path="/*"
        element={(
          <MainLayout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/generate"
                element={<ProtectedRoute><Generator /></ProtectedRoute>}
              />
              <Route
                path="/artworks"
                element={<ProtectedRoute><MyArtworks /></ProtectedRoute>}
              />
              <Route
                path="/artworks/:id"
                element={<ProtectedRoute><ArtworkDetails /></ProtectedRoute>}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        )}
      />
    </Routes>
  );
}
