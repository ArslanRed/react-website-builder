import React from 'react';
import PropTypes from 'prop-types';
import EditableText from './EditableText';
import styles from '../styles/Header2.module.css';

function Header2({ title, onTitleChange }) {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </nav>
      <EditableText tag="h2" text={title} onChange={onTitleChange} className={styles.subtitle} />
    </header>
  );
}

Header2.propTypes = {
  title: PropTypes.string.isRequired,
  onTitleChange: PropTypes.func.isRequired,
};

export default Header2;
