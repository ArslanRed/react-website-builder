import React from 'react';
import PropTypes from 'prop-types';
import EditableText from './EditableText';
import EditableImage from './EditableElement'; // ✅ default export is EditableImage
import styles from '../styles/Card1.module.css';

function Card1({
  imageSrc,
  onImageChange, // <- required for EditableImage
  heading,
  onHeadingChange,
  text,
  onTextChange,
  style = {},
  elements = {},
}) {
  return (
    <div
      className={styles.card}
      style={{ ...(style || {}) }}
      data-element-id="card"
    >
      {/* Editable Image */}
      <EditableImage
        src={imageSrc}
        onChange={onImageChange}
        className={styles.imageWrapper} // wrapper div styling
        imgClassName={styles.image}    // inner img styling
        style={{ ...(elements['card-image']?.style || {}) }}
        data-element-id="card-image"
      />

      {/* Editable Heading */}
      <EditableText
        tag="h2"
        text={heading}
        onChange={onHeadingChange}
        className={styles.heading}
        data-element-id="card-heading"
        style={{
          ...(elements['card-heading']?.style || {}),
          ...(elements['card-heading']?.textStyle || {}),
        }}
      />

      {/* Editable Paragraph */}
      <EditableText
        tag="p"
        text={text}
        onChange={onTextChange}
        className={styles.text}
        data-element-id="card-text"
        style={{
          ...(elements['card-text']?.style || {}),
          ...(elements['card-text']?.textStyle || {}),
        }}
      />
    </div>
  );
}

Card1.propTypes = {
  imageSrc: PropTypes.string,
  onImageChange: PropTypes.func.isRequired,
  heading: PropTypes.string,
  onHeadingChange: PropTypes.func,
  text: PropTypes.string,
  onTextChange: PropTypes.func,
  style: PropTypes.object,
  elements: PropTypes.object,
};

export default Card1;
