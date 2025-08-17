import React, { useState } from 'react';
import { useUserTheme } from '../contexts/UserThemeContext';
import ThemesGrid from './ThemesGrid';
import GridEditor from '../components/GridEditor';
import ExportButton from '../components/ExportButton';
import { themes } from '../components/themes';
import Ecommerce from '../components/AllThemes/Ecommerce';
import '../styles/EditorPageContent.css';


export default function EditorPageContent() {
  const { userThemeConfig, setUserThemeConfig } = useUserTheme();
  const [mode, setMode] = useState('initial'); // initial | themeSelected | buildCustomTheme
  const [gridItems, setGridItems] = useState([]); // add this at the top

  const selectedTheme = themes.find((t) => t.id === userThemeConfig.themeId);

  const handleSelectTheme = (id) => {
    setMode('themeSelected');
    const theme = themes.find((t) => t.id === id);
    if (theme) {
      setUserThemeConfig({
        themeId: id,
        components: theme.components || [],
        content: { heading: '', paragraph: '' },
        styles: {},
      });
    }
  };

  const handleShowThemes = () => {
    setMode('initial');
    setUserThemeConfig({
      themeId: null,
      components: [],
      content: { heading: '', paragraph: '' },
      styles: {},
    });
  };

  const handleBuildCustomTheme = () => {
    setMode('buildCustomTheme');
    setUserThemeConfig({
      themeId: null,
      components: [],
      content: { heading: '', paragraph: '' },
      styles: {},
    });
  };

  const showThemeContent = mode === 'themeSelected' || mode === 'buildCustomTheme';

  return (
    <div className="editor-page-container">
      {/* Top Title */}
      {mode !== 'initial' && (
      <h2 className="editor-main-title">Website Editor</h2>
    )}

      {/* Toggle buttons depending on mode */}
      <div className="editor-toggle-buttons">
        
        {mode === 'buildCustomTheme' && (
          <button className="show-themes-btn" onClick={handleShowThemes}>
            Show Themes
          </button>
        )}
        {mode === 'themeSelected' && (
          <>
            <button className="show-themes-btn" onClick={handleShowThemes}>
              Show Themes
            </button>
            <button className="build-theme-btn" onClick={handleBuildCustomTheme}>
              Build Your Own Custom Theme
            </button>
          </>
        )}
      </div>

      {/* Initial full-screen welcome + 2-column layout */}
     {mode === 'initial' && (
      
  <div className="welcome-fullscreen">
    <div className="welcome-card-full">
      <h3>Welcome to Your Website Editor!</h3>
      <p>Choose a theme to start building or explore a fully custom layout with drag-and-drop components.</p>
    </div>

    <div className="initial-two-columns">
      {/* Left Column - Themes */}
      <div className="themes-column">
        <ThemesGrid
          selectedThemeId={userThemeConfig.themeId}
          onSelectTheme={handleSelectTheme}
        />
        <p className="select-theme-text">Select a theme to start building your website.</p>
      </div>

      {/* Right Column - Custom Theme Card */}
      <div className="custom-theme-column">
        <div className="build-card">
          <h3>Create Your Own Custom Theme</h3>
          <p>Drag and drop components to design a unique website layout easily.</p>
          <button className="build-theme-btn" onClick={handleBuildCustomTheme}>
            Start Building
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Theme editor */}
      {showThemeContent && (
        <div className="theme-editor-wrapper">
          <div className="theme-editor-grid">
            {selectedTheme?.fullComponent === 'Ecommerce' ? <Ecommerce /> : <GridEditor gridItems={gridItems} setGridItems={setGridItems} />
}
          </div>

          {/* Export button only in theme editor or custom theme */}
          <div className="export-button-wrapper">
            <ExportButton
              mode={mode}
              themeComponents={userThemeConfig.components}
              content={userThemeConfig.content}
              gridItems={gridItems}
            />
          </div>
        </div>
      )}
    </div>
  );
}
