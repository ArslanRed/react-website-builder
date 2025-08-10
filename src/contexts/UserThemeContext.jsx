import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const UserThemeContext = createContext();

export function UserThemeProvider({ children }) {
  const [userThemeConfig, setUserThemeConfig] = useState({
    themeId: null,
    components: [],
    content: {
      heading: '',
      paragraph: '',
    },
    styles: {},
  });

  return (
    <UserThemeContext.Provider value={{ userThemeConfig, setUserThemeConfig }}>
      {children}
    </UserThemeContext.Provider>
  );
}

UserThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUserTheme() {
  const context = useContext(UserThemeContext);
  if (!context) {
    throw new Error('useUserTheme must be used within a UserThemeProvider');
  }
  return context;
}
