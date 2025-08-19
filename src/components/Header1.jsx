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
  elements = {},
}) {
  return (
    <header
      className={styles.header}
      style={{
        ...(style || {}),
        ...(elements['header']?.style || {})
      }}
      data-element-id="header"
    >
      {/* Logo / Title Container */}
      <div
        className={styles.logo}
        data-element-id="logo"
        style={{
          flex: '0 0 auto',
          marginBottom: '0.5rem',
          ...(elements['logo']?.style || {})
        }}
      >
        <EditableText
          tag="h1"
          text={title}
          onChange={onTitleChange}
          className={styles.title}
          data-element-id="title"
          style={{
            ...(elements['title']?.style || {}),
            ...(elements['title']?.textStyle || {})
          }}
        />
      </div>

      {/* Navigation */}
      <nav 
        className={styles.nav}
        data-element-id="nav"
        style={{
          flex: '1 1 auto',
          ...(elements['nav']?.style || {})
        }}
      >
        <ul
          className={styles.navList}
          data-element-id="navList"
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            ...(elements['navList']?.style || {})
          }}
        >
          {navItems.map((item, index) => (
            <li 
              key={item.id || index}
              data-element-id={`navItem-${index}`}
              style={{ ...(elements[`navItem-${index}`]?.style || {}) }}
            >
              <EditableText
                tag="a"
                text={item.content}
                onChange={(val) => onNavItemChange(index, val)}
                className={styles.navLink}
                style={{
                  // FIXED: Only use textStyle for text styling
                  ...(elements[`navItem-${index}`]?.textStyle || {})
                }}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* CTA Button */}
      <div 
        className={styles.ctaButton}
        data-element-id="cta"
        style={{
          display: 'inline-block',
          // FIXED: Use style for container styling
          ...(elements['cta']?.style || {})
        }}
      >
        <EditableText
          tag="span"
          text={ctaItems[0]?.content || "CTA"}
          onChange={(val) => onCtaChange(0, val)}
          style={{
            // FIXED: Use textStyle for text styling
            ...(elements['cta']?.textStyle || {})
          }}
        />
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