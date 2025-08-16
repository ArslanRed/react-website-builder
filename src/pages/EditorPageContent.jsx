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

  const showCard = mode === 'initial';
  const showThemesGrid = mode === 'initial';
  const showThemeContent = mode === 'themeSelected' || mode === 'buildCustomTheme';

  return (
    <div className="editor-page-container">
      {showCard && (
        <div className="editor-center-content">
          <h2 className="editor-title">Website Builder Editor</h2>

          <div className="editor-buttons">
            <button className="build-theme-btn" onClick={handleBuildCustomTheme}>
              Build Your Own Custom Theme
            </button>
          </div>

          <div className="welcome-card">
            <h3>Welcome to the Editor!</h3>
            <p>Select a theme below or build your own custom theme by dragging components.</p>
          </div>

          <ThemesGrid selectedThemeId={userThemeConfig.themeId} onSelectTheme={handleSelectTheme} />
          <p className="select-theme-text">
            Select a theme to start building your website.
          </p>

          <div className="export-button-wrapper">
            <ExportButton
              mode={mode}
              themeComponents={userThemeConfig.components}
              content={userThemeConfig.content}
            />
          </div>
        </div>
      )}

      {showThemeContent && (
        <div className="theme-editor-wrapper">
          <div className="theme-editor-header">
            <div className="editor-buttons">
              <button className="show-themes-btn" onClick={handleShowThemes}>
                Show Themes
              </button>
              <button className="build-theme-btn" onClick={handleBuildCustomTheme}>
                Build Your Own Custom Theme
              </button>
            </div>
          </div>

          <div className="theme-editor-grid">
            {selectedTheme?.fullComponent === 'Ecommerce' ? (
              <Ecommerce />
            ) : (
              <GridEditor />
            )}
          </div>

          <div className="export-button-wrapper">
            <ExportButton
              mode={mode}
              themeComponents={userThemeConfig.components}
              content={userThemeConfig.content}
            />
          </div>
        </div>
      )}
    </div>
  );
}
