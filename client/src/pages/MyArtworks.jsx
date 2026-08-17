import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import { listArtworks, deleteArtwork } from '../services/artworkService.js';
import { getErrorMessage } from '../services/api.js';

export default function MyArtworks() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    listArtworks()
      .then(setArtworks)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(
    () => artworks.filter((a) => a.title.toLowerCase().includes(query.toLowerCase())),
    [artworks, query],
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this artwork? This cannot be undone.')) return;
    try {
      await deleteArtwork(id);
      setArtworks((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Artworks</h1>
        <Link to="/generate"><Button>+ New</Button></Link>
      </div>
      <Alert>{error}</Alert>

      <input
        type="text"
        placeholder="Search by title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full md:w-80 bg-black border border-gray-700 rounded-md px-3 py-2 mb-6"
      />

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card><p className="text-gray-400">No artworks found.</p></Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((artwork) => (
            <Card key={artwork.id} className="flex flex-col">
              <Link to={`/artworks/${artwork.id}`}>
                <p className="font-semibold mb-2 truncate hover:text-accent">{artwork.title}</p>
                <pre className="ascii-output text-accent text-[4px] max-h-28 overflow-hidden mb-3">{artwork.ascii_content}</pre>
              </Link>
              <p className="text-xs text-gray-600 mb-3">
                {new Date(artwork.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-auto">
                <Link to={`/artworks/${artwork.id}`}><Button variant="secondary" className="text-xs px-2 py-1">View</Button></Link>
                <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDelete(artwork.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
