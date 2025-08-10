import React from 'react';
import PropTypes from 'prop-types';
import Header1 from './Header1';
import Header2 from './Header2';

// Additional components like Hero and Footer
function Hero({ subtitle }) {
  return (
    <section style={{ padding: '2rem', background: '#eee' }}>
      <p>{subtitle}</p>
    </section>
  );
}

function Footer1() {
  return (
    <footer style={{ padding: '1rem', background: '#333', color: 'white' }}>
      © 2025 Your Company
    </footer>
  );
}

function ThemeContainer({ themeComponents, content, onContentChange }) {
  // Helper handlers for editable text changes
  const handleHeadingChange = (newHeading) => {
    onContentChange({ ...content, heading: newHeading });
  };

  const handleParagraphChange = (newParagraph) => {
    onContentChange({ ...content, paragraph: newParagraph });
  };

  return (
    <>
      {themeComponents.map((compId) => {
        switch (compId) {
          case 'header1':
            return (
              <Header1
                key="header1"
                title={content.heading || 'Default Title'}
                onTitleChange={handleHeadingChange}
              />
            );
          case 'header2':
            return (
              <Header2
                key="header2"
                title={content.heading || 'Default Title'}
                onTitleChange={handleHeadingChange}
              />
            );
          case 'hero':
            return <Hero key="hero" subtitle={content.paragraph || ''} />;
          case 'footer1':
            return <Footer1 key="footer1" />;
          default:
            return null;
        }
      })}
    </>
  );
}

ThemeContainer.propTypes = {
  themeComponents: PropTypes.arrayOf(PropTypes.string).isRequired,
  content: PropTypes.shape({
    heading: PropTypes.string,
    paragraph: PropTypes.string,
  }),
  onContentChange: PropTypes.func.isRequired,
};

ThemeContainer.defaultProps = {
  content: {
    heading: '',
    paragraph: '',
  },
};

export default ThemeContainer;
