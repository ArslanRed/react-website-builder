import React from 'react';
import PropTypes from 'prop-types';
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
      role="list"
    >
      {themes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          isSelected={selectedThemeId === theme.id}
          onSelect={onSelectTheme}
          role="listitem"
        />
      ))}
    </div>
  );
}

ThemesGrid.propTypes = {
  selectedThemeId: PropTypes.string,
  onSelectTheme: PropTypes.func.isRequired,
};

ThemesGrid.defaultProps = {
  selectedThemeId: null,
};
