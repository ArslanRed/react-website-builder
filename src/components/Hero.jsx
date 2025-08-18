import React from 'react';
import PropTypes from 'prop-types';
import EditableText from './EditableText';
import styles from '../styles/Hero.module.css';

function Hero({
  heading,
  onHeadingChange,
  subheading,
  onSubheadingChange,
  ctaText,
  onCtaChange,
  backgroundImage,
  style = {},
  elements = {},
}) {
  return (
    <section
      className={styles.hero}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        ...(style || {}),
        ...(elements['hero']?.style || {}),
      }}
      data-element-id="hero"
    >
      {/* Heading */}
      <EditableText
        tag="h1"
        text={heading}
        onChange={onHeadingChange}
        className={styles.heading}
        data-element-id="hero-heading"
        style={{ ...(elements['heading']?.style || {}), ...(elements['heading']?.textStyle || {}) }}
      />

      {/* Subheading */}
      <EditableText
        tag="p"
        text={subheading}
        onChange={onSubheadingChange}
        className={styles.subheading}
        data-element-id="hero-subheading"
        style={{ ...(elements['subheading']?.style || {}), ...(elements['subheading']?.textStyle || {}) }}
      />

      {/* CTA Button */}
      {ctaText && (
        <button
          className={styles.ctaButton}
          data-element-id="hero-cta"
          style={{ ...(elements['cta']?.style || {}) }}
        >
          <EditableText
            tag="span"
            text={ctaText}
            onChange={onCtaChange}
            style={{ ...(elements['cta']?.textStyle || {}) }}
          />
        </button>
      )}
    </section>
  );
}

Hero.propTypes = {
  heading: PropTypes.string,
  onHeadingChange: PropTypes.func,
  subheading: PropTypes.string,
  onSubheadingChange: PropTypes.func,
  ctaText: PropTypes.string,
  onCtaChange: PropTypes.func,
  backgroundImage: PropTypes.string,
  style: PropTypes.object,
  elements: PropTypes.object,
};

export default Hero;
