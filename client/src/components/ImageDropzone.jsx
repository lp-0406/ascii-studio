import React, { useRef, useState } from 'react';

export default function ImageDropzone({ onFileSelected, previewUrl }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive ? 'border-accent bg-accent/5' : 'border-gray-700 hover:border-gray-500'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-md" />
      ) : (
        <div className="text-gray-400">
          <p className="font-medium">Drag & drop an image, or click to browse</p>
          <p className="text-xs mt-1 text-gray-600">JPG, PNG, or WEBP &mdash; up to 5MB</p>
        </div>
      )}
    </div>
  );
}
