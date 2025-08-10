import React from 'react';
import { UserThemeProvider } from '../contexts/UserThemeContext';
import EditorPageContent from './EditorPageContent';

export default function EditorPage() {
  return (
    <UserThemeProvider>
      <EditorPageContent />
    </UserThemeProvider>
  );
}
