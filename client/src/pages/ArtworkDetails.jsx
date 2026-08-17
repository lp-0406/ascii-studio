import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import AsciiOutput from '../components/AsciiOutput.jsx';
import { getArtwork, deleteArtwork, shareArtwork } from '../services/artworkService.js';
import { getErrorMessage } from '../services/api.js';

export default function ArtworkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    getArtwork(id).then(setArtwork).catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this artwork? This cannot be undone.')) return;
    try {
      await deleteArtwork(id);
      navigate('/artworks');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const { shareToken } = await shareArtwork(id);
      const url = `${window.location.origin}/share/${shareToken}`;
      setShareLink(url);
      navigator.clipboard.writeText(url).catch(() => {});
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = () => {
    if (!artwork) return;
    const header = `ASCII Studio | ${artwork.title} | ${artwork.created_at}\n\n`;
    const blob = new Blob([header + artwork.ascii_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artwork.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <Alert>{error}</Alert>;
  if (!artwork) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">{artwork.title}</h1>
      </div>
      <p className="text-gray-500 mb-6">
        Created {new Date(artwork.created_at).toLocaleString()} from {artwork.original_filename}
      </p>

      <Card className="mb-6">
        <AsciiOutput content={artwork.ascii_content} />
      </Card>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="secondary" onClick={handleDownload}>Download .txt</Button>
        <Button variant="secondary" onClick={handleShare} disabled={sharing}>
          {sharing ? 'Sharing...' : 'Share'}
        </Button>
        <Button variant="danger" onClick={handleDelete}>Delete</Button>
      </div>

      {shareLink && (
        <Card>
          <p className="text-sm text-gray-400 mb-1">Public share link (copied to clipboard):</p>
          <p className="text-accent font-mono text-sm break-all">{shareLink}</p>
        </Card>
      )}

      {artwork.settings && (
        <Card className="mt-6">
          <p className="text-sm font-semibold mb-2">Settings used</p>
          <pre className="text-xs text-gray-400">{JSON.stringify(artwork.settings, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}
