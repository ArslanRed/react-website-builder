import React from 'react';
import EditableText from './EditableText';
import styles from '../styles/Header1.module.css';

function Header1({ title, onTitleChange }) {
  return (
    <header className={styles.header}>
      <EditableText tag="h1" text={title} onChange={onTitleChange} className={styles.title} />
      <nav>
        <ul className={styles.navList}>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header1;
