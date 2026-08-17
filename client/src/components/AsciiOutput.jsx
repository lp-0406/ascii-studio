import React from 'react';

export default function AsciiOutput({ content }) {
  if (!content) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 border border-dashed border-gray-700 rounded-lg">
        Your generated ASCII art will appear here.
      </div>
    );
  }

  return (
    <pre className="ascii-output bg-black text-accent border border-gray-800 rounded-lg p-4 max-h-[520px] overflow-auto">
      {content}
    </pre>
  );
}
