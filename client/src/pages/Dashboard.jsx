import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import useAuth from '../hooks/useAuth.js';
import { listArtworks } from '../services/artworkService.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listArtworks()
      .then(setArtworks)
      .finally(() => setLoading(false));
  }, []);

  const recent = artworks.slice(0, 3);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}</h1>
      <p className="text-gray-500 mb-8">Here&apos;s a snapshot of your ASCII Studio activity.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card>
          <p className="text-gray-500 text-sm mb-1">Total Artworks</p>
          <p className="text-4xl font-bold text-accent">{loading ? '-' : artworks.length}</p>
        </Card>
        <Card className="md:col-span-2 flex flex-col justify-center gap-3">
          <p className="text-gray-500 text-sm">Quick actions</p>
          <div className="flex gap-3">
            <Link to="/generate">
              <Button>Generate ASCII</Button>
            </Link>
            <Link to="/artworks">
              <Button variant="secondary">View History</Button>
            </Link>
          </div>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent artwork</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : recent.length === 0 ? (
        <Card>
          <p className="text-gray-400">You haven&apos;t generated any artwork yet.</p>
          <Link to="/generate" className="text-accent hover:underline text-sm">Create your first piece &rarr;</Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {recent.map((artwork) => (
            <Link key={artwork.id} to={`/artworks/${artwork.id}`}>
              <Card className="hover:border-accent transition-colors h-full">
                <p className="font-semibold mb-2 truncate">{artwork.title}</p>
                <pre className="ascii-output text-accent text-[4px] max-h-24 overflow-hidden">{artwork.ascii_content}</pre>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
