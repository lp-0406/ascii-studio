import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Alert from '../components/Alert.jsx';
import AsciiOutput from '../components/AsciiOutput.jsx';
import { getSharedArtwork } from '../services/artworkService.js';
import { getErrorMessage } from '../services/api.js';

export default function SharedArtwork() {
  const { token } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSharedArtwork(token).then(setArtwork).catch((err) => setError(getErrorMessage(err)));
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="font-mono font-bold text-accent mb-8">&gt;_ ASCII Studio</Link>

      {error && <Alert>{error}</Alert>}

      {artwork && (
        <Card className="max-w-3xl w-full">
          <h1 className="text-2xl font-bold mb-1">{artwork.title}</h1>
          <p className="text-gray-500 text-sm mb-4">Shared ASCII artwork</p>
          <AsciiOutput content={artwork.asciiContent} />
        </Card>
      )}
    </div>
  );
}
