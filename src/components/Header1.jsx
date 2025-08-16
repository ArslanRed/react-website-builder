import React from 'react';
import PropTypes from 'prop-types';
import EditableText from './EditableText';
import styles from '../styles/Header1.module.css';

function Header1({
  title,
  onTitleChange,
  navItems = [],
  onNavItemChange = () => {},
  ctaItems = [],
  onCtaChange = () => {},
  style = {},
  elements = {},   // element-level styles
}) {
  return (
    <header
      className={styles.header}
      style={{ ...(style || {}) }}
      data-element-id="header"
    >
      {/* Logo / Title */}
      <div
        className={styles.logo}
        data-element-id="logo"
        style={{ flex: '0 0 auto', marginBottom: '0.5rem', ...(elements['logo']?.style || {}) }}
      >
        <EditableText
          tag="h1"
          text={title}
          onChange={onTitleChange}
          className={styles.title}
          data-element-id="title"
           style={{
    ...(elements['title']?.style || {}), // container styles
    ...(elements['title']?.textStyle || {}) , color: elements['title']?.textStyle?.color || 'inherit',// text-specific styles
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={styles.nav} data-element-id="nav" style={{ flex: '1 1 auto', ...(elements['nav']?.style || {}) }}>
        <ul
          className={styles.navList}
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            ...(elements['nav']?.listStyle || {}),
          }}
        >
          {navItems.map((item, index) => (
            <li key={item.id || index} data-element-id={`navItem-${index}`}
  style={{ ...(elements[`navItem-${index}`]?.style || {}) }} >
              <EditableText
                tag="a"
                text={item.content}
                onChange={(val) => onNavItemChange(index, val)}
                className={styles.navLink}
                
                 
  style={{ ...(elements[`navItem-${index}`]?.style || {}), ...(elements[`navItem-${index}`]?.textStyle || {}) }}
                
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* CTA buttons */}
      <div
        className={styles.cta}
        data-element-id="cta"
        style={{
          flex: '0 0 auto',
          marginTop: '0.5rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          ...(elements['cta']?.style || {}),
        }}
      >
        {/* CTA buttons */}
{ctaItems.map((cta, index) => {
  const elemStyles = elements[`cta-${index}`] || {};
  return (
    <div
      key={cta.id || index}
      data-element-id={`cta-${index}`}
       style={{
        ...(elemStyles.style || {}), // only individual CTA style
      }}
    >
      <EditableText
        tag="span"
        text={cta.content}
        onChange={(val) => onCtaChange(index, val)}
        className={styles.ctaButton}
        style={{ ...(elemStyles.style || {}), ...(elemStyles.textStyle || {}) }} // inner text style
      />
    </div>
  );
})}

      </div>
    </header>
  );
}

Header1.propTypes = {
  title: PropTypes.string,
  onTitleChange: PropTypes.func,
  navItems: PropTypes.array,
  onNavItemChange: PropTypes.func,
  ctaItems: PropTypes.array,
  onCtaChange: PropTypes.func,
  style: PropTypes.object,
  elements: PropTypes.object,
};

export default Header1;
