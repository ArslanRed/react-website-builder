import React from 'react';
import PropTypes from 'prop-types';
import EditableText from './EditableText';
import EditableImage from './EditableElement';
import styles from '../styles/Card1.module.css';

function Card1({
  imageSrc,
  onImageChange,
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
      style={{ ...(style || {}), ...(elements['card']?.style || {}) }}
      data-element-id="card"
    >
      <EditableImage
        src={imageSrc}
        onChange={onImageChange}
        className={styles.imageWrapper}
        imgClassName={styles.image}
        style={{ ...(elements['image']?.style || {}) }}
        data-element-id="image"
      />

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
