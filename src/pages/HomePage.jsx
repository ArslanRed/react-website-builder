import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero-section">
        <div className="hero-left">
          <h1>Build Your Dream Website Easily</h1>
          <p>Create stunning websites with customizable themes and drag & drop editing.</p>
          <button 
            className="btn-build"
            onClick={() => navigate('/editor')}
          >
            Build Your Own Website
          </button>
        </div>
        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
            alt="Website builder illustration"
          />
        </div>
      </section>

      <section className="mid-content">
        <h2>Why Choose Us?</h2>
        <p>
          Our builder offers flexible themes, intuitive editing, and full control over your site.
          Perfect for e-commerce, blogs, portfolios, and more!
        </p>
      </section>
   </>
  );
}
