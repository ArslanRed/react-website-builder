import React from 'react';
import PropTypes from 'prop-types';
import './ThemeCard.css';

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
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(theme.id);
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select theme: ${theme.name}`}
    >
      <img
        src={theme.thumbnail}
        alt={`${theme.name} thumbnail`}
        style={{ width: '100%', borderRadius: '6px', marginBottom: '0.5rem' }}
        loading="lazy"
      />
      <h3>{theme.name}</h3>
      <p style={{ fontSize: '0.9rem', color: '#555' }}>{theme.description}</p>
    </div>
  );
}

ThemeCard.propTypes = {
  theme: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

ThemeCard.defaultProps = {
  isSelected: false,
};
