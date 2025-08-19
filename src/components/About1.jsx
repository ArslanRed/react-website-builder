import React from "react";
import PropTypes from "prop-types";
import EditableText from "./EditableText";
import EditableImage from "./EditableElement";
import styles from "../styles/About1.module.css";

function About1({
  heading,
  onHeadingChange,
  text,
  onTextChange,
  imageSrc,
  onImageChange,
  children,
  style = {},
  elements = {},
}) {
  return (
    <section
      className={styles.about}
      style={{
        ...(style || {}),
        // FIXED: Only use style for section container, not textStyle
        ...(elements['about1']?.style || {})
      }}
      data-element-id="about1"
    >
      {/* Editable Image */}
      <EditableImage
        src={imageSrc}
        onChange={onImageChange}
        className={styles.imageWrapper}
        imgClassName={styles.image}
        style={{ ...(elements["image"]?.style || {}) }}
        data-element-id="image"
      />

      {/* Editable Heading */}
      <EditableText
        tag="h2"
        text={heading}
        onChange={onHeadingChange}
        className={styles.heading}
        style={{
          ...(elements["heading"]?.style || {}),
          ...(elements["heading"]?.textStyle || {}),
        }}
        data-element-id="heading"
      />

      {/* Editable Paragraph */}
      <EditableText
        tag="p"
        text={text}
        onChange={onTextChange}
        className={styles.text}
        style={{
          ...(elements["text"]?.style || {}),
          ...(elements["text"]?.textStyle || {}),
        }}
        data-element-id="text"
      />

      {/* Optional Children Wrapper */}
      {children && (
        <div
          className={styles.childrenWrapper}
          style={{
            ...(elements["childrenWrapper"]?.style || {})
          }}
          data-element-id="childrenWrapper"
        >
          {children}
        </div>
      )}
    </section>
  );
}

About1.propTypes = {
  heading: PropTypes.string,
  onHeadingChange: PropTypes.func,
  text: PropTypes.string,
  onTextChange: PropTypes.func,
  imageSrc: PropTypes.string,
  onImageChange: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.object,
  elements: PropTypes.object,
};

export default About1;