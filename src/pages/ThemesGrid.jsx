import React from 'react';
import ThemeCard from '../components/ThemeCard';
import { themes } from '../components/themes';

export default function ThemesGrid({ selectedThemeId, onSelectTheme }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '2rem',
      }}
    >
      {themes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          isSelected={selectedThemeId === theme.id}
          onSelect={onSelectTheme}
        />
      ))}
    </div>
  );
}
