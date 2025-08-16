import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import Bubbles from '../components/Bubbles'
export default function HomePage() {
  const navigate = useNavigate();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <>
    <div style={{ position: "relative" }}>
      <Bubbles count={30} />
      {/* Hero Section */}
      <section
        className="hero-section"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="hero-left">
          <h1>Build Your Dream Website Easily</h1>
          <p>Create stunning websites with customizable themes and drag & drop editing.</p>
          <button className="btn-build" onClick={() => navigate('/editor')}>
            Build Your Own Website
          </button>
        </div>
        <div
          className="hero-right"
          style={{
            transform: `rotateX(${-rotate.x}deg) rotateY(${rotate.y}deg)`
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
            alt="Website builder illustration"
          />
        </div>
      </section>

      {/* Mid Content Section */}
      <section className="mid-content">
        <h2>Why Choose Us?</h2>
        <p>
          Our builder offers flexible themes, intuitive editing, and full control over your site.
          Perfect for e-commerce, blogs, portfolios, and more!
        </p>
      </section>
      </div>
    </>
  );
}
