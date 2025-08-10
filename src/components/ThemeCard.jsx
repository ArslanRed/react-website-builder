import React from 'react';

export default function ThemeCard({ theme, isSelected, onSelect }) {
  return (
    <div
      className={`theme-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(theme.id)}
      style={{
        border: isSelected ? '3px solid #4f46e5' : '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        cursor: 'pointer',
        width: '200px',
        textAlign: 'center',
        boxShadow: isSelected ? '0 0 15px rgba(79,70,229,0.6)' : 'none',
        userSelect: 'none',
      }}
    >
      <img
        src={theme.thumbnail}
        alt={`${theme.name} thumbnail`}
        style={{ width: '100%', borderRadius: '6px', marginBottom: '0.5rem' }}
      />
      <h3>{theme.name}</h3>
      <p style={{ fontSize: '0.9rem', color: '#555' }}>{theme.description}</p>
    </div>
  );
}
