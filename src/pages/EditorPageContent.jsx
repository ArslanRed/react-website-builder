import React, { useState } from 'react';
import { useUserTheme } from '../contexts/UserThemeContext';
import ThemesGrid from './ThemesGrid';
import ThemeContainer from '../components/ThemeContainer';
import ExportButton from '../components/ExportButton';
import SideBar from '../components/SideBar';
import EditableText from '../components/EditableText';
import { components } from '../components/component';
import { themes } from '../components/themes';
import Ecommerce from '../components/AllThemes/Ecommerce';

export default function EditorPageContent() {
  const { userThemeConfig, setUserThemeConfig } = useUserTheme();
  const [mode, setMode] = useState('initial'); // initial | themeSelected | buildCustomTheme

  const selectedTheme = themes.find((t) => t.id === userThemeConfig.themeId);

  function handleSelectTheme(id) {
    setMode('themeSelected');
    // Set themeId and default components if theme has predefined components
    const theme = themes.find((t) => t.id === id);
    if (theme) {
      if (theme.components) {
        setUserThemeConfig({
          themeId: id,
          components: theme.components,
          content: { heading: '', paragraph: '' },
          styles: {},
        });
      } else {
        // For fullComponent or unknown themes fallback
        setUserThemeConfig({
          themeId: id,
          components: [],
          content: { heading: '', paragraph: '' },
          styles: {},
        });
      }
    }
  }

  function handleShowThemes() {
    setMode('initial');
    setUserThemeConfig({
      themeId: null,
      components: [],
      content: { heading: '', paragraph: '' },
      styles: {},
    });
  }

  function handleBuildCustomTheme() {
    setMode('buildCustomTheme');
    setUserThemeConfig({
      themeId: null,
      components: [],
      content: { heading: '', paragraph: '' },
      styles: {},
    });
  }

  function handleAddComponent(compId) {
    setUserThemeConfig((prev) => {
      if (!prev.components.includes(compId)) {
        return { ...prev, components: [...prev.components, compId] };
      }
      return prev;
    });
  }

  function handleContentChange(newContent) {
    setUserThemeConfig((prev) => ({ ...prev, content: newContent }));
  }

  const showSidebar = mode === 'buildCustomTheme';
  const showCard = mode === 'initial';
  const showThemesGrid = mode === 'initial';
  const showThemeContent = mode === 'themeSelected' || mode === 'buildCustomTheme';

  return (
    <div style={{ display: 'flex', height: '100vh', boxSizing: 'border-box' }}>
      {showSidebar && (
        <SideBar
          options={components}
          selectedIds={userThemeConfig.components}
          onSelect={handleAddComponent}
          style={{ width: '220px' }}
        />
      )}

      <main
        style={{
          flexGrow: 1,
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
            <p>Select a theme below or build your own custom theme by selecting components.</p>
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
            {/* Render fullComponent if available */}
            {selectedTheme?.fullComponent === 'Ecommerce' ? (
              <Ecommerce />
            ) : (
              
              <div className="theme-container">
                <ThemeContainer
                  themeComponents={userThemeConfig.components}
                  content={userThemeConfig.content}
                  onContentChange={handleContentChange}
                />
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
