import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import ImageDropzone from '../components/ImageDropzone.jsx';
import SettingsPanel, { DEFAULT_SETTINGS } from '../components/SettingsPanel.jsx';
import AsciiOutput from '../components/AsciiOutput.jsx';
import { generateAscii, createArtwork } from '../services/artworkService.js';
import { getErrorMessage } from '../services/api.js';

export default function Generator() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [result, setResult] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleFileSelected = (selected) => {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResult(null);
    if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''));
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('Please choose an image first.');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const data = await generateAscii(file, settings);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const artwork = await createArtwork({
        title: title || 'Untitled Artwork',
        asciiContent: result.asciiContent,
        originalFilename: result.originalFilename,
        settings: result.settings,
      });
      setSaveMessage('Saved!');
      setTimeout(() => navigate(`/artworks/${artwork.id}`), 600);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (result) navigator.clipboard.writeText(result.asciiContent);
  };

  const handleDownload = () => {
    if (!result) return;
    const header = `ASCII Studio | ${title || 'Untitled'} | ${new Date().toISOString()}\n\n`;
    const blob = new Blob([header + result.asciiContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'ascii-art').replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">ASCII Generator</h1>
      <p className="text-gray-500 mb-8">Upload an image, tune the settings, and generate your art.</p>
      <Alert>{error}</Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-4">1. Image</h2>
          <ImageDropzone onFileSelected={handleFileSelected} previewUrl={previewUrl} />

          <h2 className="font-semibold mt-6 mb-4">2. Settings</h2>
          <SettingsPanel settings={settings} onChange={setSettings} />

          <Button onClick={handleGenerate} disabled={generating || !file} className="w-full mt-6">
            {generating ? 'Generating...' : 'Generate ASCII'}
          </Button>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">ASCII Output</h2>
          <AsciiOutput content={result?.asciiContent} />

          {result && (
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title your artwork"
                className="w-full bg-black border border-gray-700 rounded-md px-3 py-2"
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={handleCopy}>Copy</Button>
                <Button variant="secondary" onClick={handleDownload}>Download</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </div>
              {saveMessage && <p className="text-accent text-sm">{saveMessage}</p>}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
