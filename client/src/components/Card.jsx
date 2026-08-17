import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-panel border border-gray-800 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}
