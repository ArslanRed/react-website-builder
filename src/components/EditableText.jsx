import React, { useEffect } from 'react';
import { useUserTheme } from '../contexts/UserThemeContext';

export default function EditableText({ themeId }) {
  const { userThemeConfig, setUserThemeConfig } = useUserTheme();

  useEffect(() => {
    // When theme changes, reset content
    if (themeId === 'ecommerce') {
      setUserThemeConfig({
        themeId,
        components: ['header1', 'hero', 'footer1'], // example
        content: {
          heading: 'Welcome to Your E-Commerce Store',
          paragraph: 'Start adding your amazing products today!',
        },
        styles: {},
      });
    } else if (themeId === 'portfolio') {
      setUserThemeConfig({
        themeId,
        components: ['header2', 'hero'],
        content: {
          heading: 'My Portfolio',
          paragraph: 'Showcase your work and projects.',
        },
        styles: {},
      });
    } else if (themeId === 'blog') {
      setUserThemeConfig({
        themeId,
        components: ['header1', 'hero', 'footer1'],
        content: {
          heading: 'My Blog',
          paragraph: 'Share your stories with the world.',
        },
        styles: {},
      });
    } else {
      setUserThemeConfig({
        themeId: null,
        components: [],
        content: {
          heading: '',
          paragraph: '',
        },
        styles: {},
      });
    }
  }, [themeId, setUserThemeConfig]);

  // Update heading & paragraph in user config
  function onHeadingChange(newHeading) {
    setUserThemeConfig((prev) => ({
      ...prev,
      content: { ...prev.content, heading: newHeading },
    }));
  }

  function onParagraphChange(newParagraph) {
    setUserThemeConfig((prev) => ({
      ...prev,
      content: { ...prev.content, paragraph: newParagraph },
    }));
  }

  return (
    <div>
      <input
        type="text"
        value={userThemeConfig.content.heading}
        onChange={e => onHeadingChange(e.target.value)}
        style={{ fontSize: '2rem', fontWeight: 'bold', width: '100%', marginBottom: '1rem' }}
        placeholder="Edit Heading"
      />
      <textarea
        value={userThemeConfig.content.paragraph}
        onChange={e => onParagraphChange(e.target.value)}
        style={{ width: '100%', minHeight: '150px', fontSize: '1.1rem', padding: '0.5rem' }}
        placeholder="Edit Paragraph"
      />
    </div>
  );
}
