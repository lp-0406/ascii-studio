import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';

const EXAMPLE_ASCII = `@@@@@@@@@@@@@%%%%%%%%%%%
@@@@%%%%####****++++===
%%%%####****++++====---
####****++++====----::::
****++++====----::::....
++++====----::::........`;

export default function Landing() {
  return (
    <div>
      <section className="text-center py-16">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          ASCII <span className="text-accent">Studio</span>
        </h1>
        <p className="text-xl text-gray-300 mb-2">Turn Pixels Into Characters.</p>
        <p className="max-w-2xl mx-auto text-gray-500 mb-8">
          Upload an image, customize the conversion, and transform it into beautiful ASCII art.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/generate" className="px-6 py-3 rounded-md bg-accent text-ink font-semibold hover:bg-accentDark transition-colors">
            Generate ASCII
          </Link>
          <Link to="/login" className="px-6 py-3 rounded-md border border-gray-700 hover:border-accent hover:text-accent transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      <section className="py-8">
        <pre className="ascii-output bg-black text-accent border border-gray-800 rounded-lg p-6 max-w-xl mx-auto text-center">
          {EXAMPLE_ASCII}
        </pre>
      </section>

      <section className="grid md:grid-cols-3 gap-6 py-16">
        <Card>
          <h3 className="font-semibold text-lg mb-2">Upload &amp; Customize</h3>
          <p className="text-gray-400 text-sm">Drop in any JPG, PNG, or WEBP image and fine-tune width, character set, brightness, and contrast.</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-lg mb-2">Real Conversion Engine</h3>
          <p className="text-gray-400 text-sm">Every pixel is analyzed server-side and mapped to characters based on brightness &mdash; no shortcuts.</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-lg mb-2">Save &amp; Share</h3>
          <p className="text-gray-400 text-sm">Keep a history of your creations, download them as text files, or share a public link.</p>
        </Card>
      </section>

      <section className="py-16">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[
            ['1', 'Upload', 'Choose an image from your device'],
            ['2', 'Configure', 'Adjust width, charset, brightness & contrast'],
            ['3', 'Generate', 'The backend converts pixels to characters'],
            ['4', 'Save & Share', 'Keep it in your history or share a public link'],
          ].map(([num, title, desc]) => (
            <div key={num}>
              <div className="w-10 h-10 rounded-full bg-accent text-ink font-bold flex items-center justify-center mx-auto mb-3">{num}</div>
              <h4 className="font-semibold mb-1">{title}</h4>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
