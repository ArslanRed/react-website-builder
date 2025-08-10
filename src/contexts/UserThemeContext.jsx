import React, { createContext, useContext, useState } from 'react';

const UserThemeContext = createContext();

export function UserThemeProvider({ children }) {
  const [userThemeConfig, setUserThemeConfig] = useState({
    themeId: null,
    components: [], // example: ['header1', 'hero', 'footer1']
    content: {
      heading: '',
      paragraph: '',
    },
    styles: {}, // optional user styles
  });

  return (
    <UserThemeContext.Provider value={{ userThemeConfig, setUserThemeConfig }}>
      {children}
    </UserThemeContext.Provider>
  );
}

export function useUserTheme() {
  return useContext(UserThemeContext);
}
