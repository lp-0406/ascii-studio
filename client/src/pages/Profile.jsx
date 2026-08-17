import React from 'react';
import Card from '../components/Card.jsx';
import useAuth from '../hooks/useAuth.js';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <Card className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-lg">{user.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Member since</p>
          <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </Card>
    </div>
  );
}
