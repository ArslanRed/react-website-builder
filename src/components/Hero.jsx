import React from 'react';
import PropTypes from 'prop-types';
import { EditableBackground } from './EditableElement';
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
  onBackgroundChange,
  style = {},
  elements = {},
}) {
  return (
    <section
      className={styles.hero}
      style={{
        ...style,
        ...(elements['hero']?.style || {}), // container
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
      data-element-id="hero"
    >
      {/* Background Image uploader */}
      <EditableBackground
        src={backgroundImage}
        onChange={onBackgroundChange}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: 8,
          zIndex: 10,
          ...(elements['hero-background']?.style || {}),
        }}
        labelText="Change Background"
        data-element-id="hero-background"
      />

      {/* Heading */}
      <EditableText
        tag="h1"
        text={heading}
        onChange={onHeadingChange}
        className={styles.heading}
        style={{
          ...(elements['hero-heading']?.style || {}),
          ...(elements['hero-heading']?.textStyle || {}),
          position: 'relative',
          zIndex: 20,
        }}
        data-element-id="hero-heading"
      />

      {/* Subheading */}
      <EditableText
        tag="p"
        text={subheading}
        onChange={onSubheadingChange}
        className={styles.subheading}
        style={{
          ...(elements['hero-subheading']?.style || {}),
          ...(elements['hero-subheading']?.textStyle || {}),
          position: 'relative',
          zIndex: 20,
        }}
        data-element-id="hero-subheading"
      />

      {/* CTA Button */}
      {ctaText && (
        <button
          className={styles.ctaButton}
          data-element-id="hero-cta"
          style={{
            ...(elements['hero-cta']?.style || {}), // button container
            position: 'relative',
            zIndex: 20,
          }}
        >
          <EditableText
            tag="span"
            text={ctaText}
            onChange={onCtaChange}
            style={{
              ...(elements['hero-cta-text']?.style || {}),     // wrapper span styles
              ...(elements['hero-cta-text']?.textStyle || {}), // text styles
              position: 'relative',
              zIndex: 20,
            }}
            data-element-id="hero-cta-text"
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
  onBackgroundChange: PropTypes.func,
  style: PropTypes.object,
  elements: PropTypes.object,
};

Hero.defaultProps = {
  heading: 'Hero Title',
  subheading: 'Hero Subtitle',
  ctaText: 'Get Started',
  backgroundImage: '',
  style: {},
  elements: {},
};

export default Hero;
