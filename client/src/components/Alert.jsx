import React from 'react';

export default function Alert({ type = 'error', children }) {
  if (!children) return null;
  const styles = type === 'error'
    ? 'bg-red-950/50 border-red-800 text-red-300'
    : 'bg-emerald-950/50 border-emerald-800 text-emerald-300';

  return (
    <div className={`border rounded-md px-4 py-3 text-sm mb-4 ${styles}`}>
      {children}
    </div>
  );
}
