import React, { useState } from 'react';
import { useUserTheme } from '../contexts/UserThemeContext';
import ThemesGrid from './ThemesGrid';
import GridEditor from '../components/GridEditor';
import ExportButton from '../components/ExportButton';
import { themes } from '../components/themes';
import Ecommerce from '../components/AllThemes/Ecommerce';
import '../styles/EditorPageContent.css'
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

  const handleContentChange = (newContent) => {
    setUserThemeConfig((prev) => ({ ...prev, content: newContent }));
  };

  const showCard = mode === 'initial';
  const showThemesGrid = mode === 'initial';
  const showThemeContent = mode === 'themeSelected' || mode === 'buildCustomTheme';

  return (
    <div style={{ display: 'flex', height: '100vh', boxSizing: 'border-box' ,  textAlign:'center'}}>
      <main
        style={{
         
          height: '100%',
          overflowY: 'auto',
          padding: '1rem',
          boxSizing: 'border-box',
         
        }}
      >
        <h2>Website Builder Editor</h2>

        {mode !== 'initial' && (
          <button
            onClick={handleShowThemes}
            style={{
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              borderRadius: 6,
              border: '1px solid #4f46e5',
              backgroundColor: 'white',
              color: '#4f46e5',
              marginBottom: '1rem',
            }}
          >
            Show Themes
          </button>
        )}

        {(mode === 'initial' || mode === 'themeSelected') && (
          <button
            onClick={handleBuildCustomTheme}
            style={{
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#4f46e5',
              color: 'white',
              marginLeft: '1rem',
              marginBottom: '1rem',
            }}
          >
            Build Your Own Custom Theme
          </button>
        )}

        {showCard && (
          <div
            style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: '1rem',
              marginBottom: '1rem',
              background: '#fafafa',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              maxWidth: 600,
            }}
          >
            <h3>Welcome to the Editor!</h3>
            <p>Select a theme below or build your own custom theme by dragging components.</p>
          </div>
        )}

        {showThemesGrid && (
          <>
            <ThemesGrid selectedThemeId={userThemeConfig.themeId} onSelectTheme={handleSelectTheme} />
            <p style={{ marginTop: '1rem', color: '#555' }}>
              Select a theme to start building your website.
            </p>
          </>
        )}

        {showThemeContent && (
          <>
            {selectedTheme?.fullComponent === 'Ecommerce' ? (
              <Ecommerce />
            ) : (
              <div className="theme-container" >
                <GridEditor />
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '2rem' }}>
          <ExportButton
            mode={mode}
            themeComponents={userThemeConfig.components}
            content={userThemeConfig.content}
          />
        </div>
      </main>
    </div>
  );
}
