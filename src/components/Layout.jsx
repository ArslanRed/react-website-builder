import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="site-wrapper">

      <header className="site-header">
        <div className="logo">MySiteBuilder</div>
        <nav className="site-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/editor" className="nav-link">Editor</Link>
          <Link to="/themes" className="nav-link">Themes</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>
      </header>

      <main className="content-wrapper">
        {children}
      </main>

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} MySiteBuilder. All rights reserved.</p>
      </footer>
    </div>
  );
}
