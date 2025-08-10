import React from 'react';

function Header1({ title }) {
  return <header style={{ background: '#4f46e5', color: 'white', padding: '1rem' }}><h1>{title}</h1></header>;
}

function Header2({ title }) {
  return <header style={{ background: '#222', color: 'white', padding: '1rem' }}><h2>{title}</h2></header>;
}

function Hero({ subtitle }) {
  return <section style={{ padding: '2rem', background: '#eee' }}><p>{subtitle}</p></section>;
}

function Footer1() {
  return <footer style={{ padding: '1rem', background: '#333', color: 'white' }}>© 2025 Your Company</footer>;
}

export default function ThemeContainer({ themeComponents = [], content = {} }) {
  return (
    <>
      {themeComponents.map((compId) => {
        switch (compId) {
          case 'header1':
            return <Header1 key="header1" title={content.heading || 'Default Title'} />;
          case 'header2':
            return <Header2 key="header2" title={content.heading || 'Default Title'} />;
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
