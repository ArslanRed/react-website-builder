import React from 'react';
import PropTypes from 'prop-types';
import EditableText from './EditableText';
import styles from '../styles/Header1.module.css';

function Header1({ title, onTitleChange }) {
  return (
    <header className={styles.header}>
      <EditableText tag="h1" text={title} onChange={onTitleChange} className={styles.title} />
      <nav aria-label="Main navigation">
        <ul className={styles.navList}>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}

Header1.propTypes = {
  title: PropTypes.string.isRequired,
  onTitleChange: PropTypes.func.isRequired,
};

export default Header1;
