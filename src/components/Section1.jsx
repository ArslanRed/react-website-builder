import React from 'react';
import PropTypes from 'prop-types';
import EditableText from './EditableText';
import styles from '../styles/Section1.module.css';

function Section1({
  heading,
  onHeadingChange,
  text,
  onTextChange,
  children,
  style = {},
  elements = {},
}) {
  return (
    <section
      className={styles.section}
      style={{
        ...(style || {}),
        ...(elements['section']?.style || {}),
      }}
      data-element-id="section"
    >
      <EditableText
        tag="h2"
        text={heading}
        onChange={onHeadingChange}
        className={styles.heading}
        data-element-id="heading"
        style={{
          ...(elements['heading']?.style || {}),
          ...(elements['heading']?.textStyle || {}),
        }}
      />

      <EditableText
        tag="p"
        text={text}
        onChange={onTextChange}
        className={styles.text}
        data-element-id="text"
        style={{
          ...(elements['text']?.style || {}),
          ...(elements['text']?.textStyle || {}),
        }}
      />

      <div
        className={styles.childrenWrapper}
        style={{ ...(elements['childrenWrapper']?.style || {}) }}
        data-element-id="childrenWrapper"
      >
        {children}
      </div>
    </section>
  );
}

Section1.propTypes = {
  heading: PropTypes.string,
  onHeadingChange: PropTypes.func,
  text: PropTypes.string,
  onTextChange: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.object,
  elements: PropTypes.object,
};

export default Section1;
