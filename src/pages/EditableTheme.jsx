import React, { useState, useEffect } from 'react';

// Simple example editable theme
export default function EditableTheme({ themeId }) {
  // For demo: store heading and paragraph editable states
  const [heading, setHeading] = useState('');
  const [paragraph, setParagraph] = useState('');

  // When theme changes, reset content (you can load theme defaults here)
  useEffect(() => {
    if (themeId === 'ecommerce') {
      setHeading('Welcome to Your E-Commerce Store');
      setParagraph('Start adding your amazing products today!');
    } else if (themeId === 'portfolio') {
      setHeading('My Portfolio');
      setParagraph('Showcase your work and projects.');
    } else if (themeId === 'blog') {
      setHeading('My Blog');
      setParagraph('Share your stories with the world.');
    } else {
      setHeading('');
      setParagraph('');
    }
  }, [themeId]);

  return (
    <div>
      <input
        type="text"
        value={heading}
        onChange={e => setHeading(e.target.value)}
        style={{ fontSize: '2rem', fontWeight: 'bold', width: '100%', marginBottom: '1rem' }}
        placeholder="Edit Heading"
      />
      <textarea
        value={paragraph}
        onChange={e => setParagraph(e.target.value)}
        style={{ width: '100%', minHeight: '150px', fontSize: '1.1rem', padding: '0.5rem' }}
        placeholder="Edit Paragraph"
      />
    </div>
  );
}
