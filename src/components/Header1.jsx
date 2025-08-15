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
}) {
  return (
    <header
      className={styles.header}
      
    >
      <div
        className={styles.logo}
        style={{ flex: '0 0 auto', marginBottom: '0.5rem' }}
      >
        <EditableText
          tag="h1"
          text={title}
          onChange={onTitleChange}
          className={styles.title}
          style={{ margin: 0, fontSize: '1.5rem', whiteSpace: 'nowrap' }}
        />
      </div>

      <nav className={styles.nav} style={{ flex: '1 1 auto' }}>
        <ul
          className={styles.navList}
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {navItems.map((item, index) => (
            <li key={item.id || index}>
              <EditableText
                tag="a"
                text={item.content}
                onChange={(val) => onNavItemChange(index, val)}
                className={styles.navLink}
                style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={styles.cta}
        style={{ flex: '0 0 auto', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
      >
        {ctaItems.map((cta, index) => (
          <EditableText
            key={cta.id || index}
            tag="a"
            text={cta.content}
            onChange={(val) => onCtaChange(index, val)}
            className={styles.ctaButton}
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              whiteSpace: 'nowrap',
            }}
          />
        ))}
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
};

export default Header1;
