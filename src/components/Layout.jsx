import React, { useState } from 'react';
import { Link , useNavigate } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  return (
    <div className="site-wrapper">

      <header className="site-header">
        <div className="logo" onClick={() => navigate('/')}>
          MySiteBuilder
        </div>

        <div className={`site-nav-container ${menuOpen ? 'open' : ''}`}>
          <nav className="site-nav">
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/editor" className="nav-link" onClick={() => setMenuOpen(false)}>Editor</Link>
            <Link to="/themes" className="nav-link" onClick={() => setMenuOpen(false)}>Themes</Link>
            <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
          </nav>
        </div>

        <div className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      <main className="content-wrapper">
        {children}
      </main>

      <footer className="site-footer">
  <div className="footer-links">
    <Link to="/about">About</Link>
    <Link to="/privacy">Privacy Policy</Link>
    <Link to="/terms">Terms of Service</Link>
    <Link to="/contact">Contact</Link>
  </div>

  <div className="footer-socials">
    <a href="https://facebook.com" target="_blank" rel="noreferrer">F</a>
    <a href="https://twitter.com" target="_blank" rel="noreferrer">T</a>
    <a href="https://linkedin.com" target="_blank" rel="noreferrer">L</a>
  </div>

  <p>&copy; {new Date().getFullYear()} MySiteBuilder. All rights reserved.</p>
</footer>
    </div>
  );
}
