import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-6xl font-mono text-accent mb-4">404</p>
      <p className="text-gray-400 mb-6">Page not found.</p>
      <Link to="/" className="text-accent hover:underline">Go back home</Link>
    </div>
  );
}
