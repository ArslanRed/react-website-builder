import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ padding: '1rem' }}>
      <label htmlFor="theme-select">Select Header Style: </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="header1">Header Style 1</option>
        <option value="header2">Header Style 2</option>
      </select>
    </div>
  );
}

export default ThemeSelector;
