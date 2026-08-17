import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p className="font-mono">ASCII Studio &mdash; Turn Pixels Into Characters.</p>
        <p>&copy; {new Date().getFullYear()} ASCII Studio. Built for learning full-stack development.</p>
      </div>
    </footer>
  );
}
