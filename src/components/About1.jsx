import React from "react";
import PropTypes from "prop-types";
import EditableText from "./EditableText";
import EditableImage from "./EditableElement"; // ✅ default export is EditableImage
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
      style={{ ...(style || {}) }}
      data-element-id="about"
    >
      {/* Editable Image */}
      <EditableImage
        src={imageSrc}
        onChange={onImageChange}
        className={styles.imageWrapper} // wrapper styles
        imgClassName={styles.image}    // inner <img> gets full size & object-fit
        style={{ ...(elements["image"]?.style || {}) }}
        data-element-id="about-image"
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
        data-element-id="about-heading"
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
        data-element-id="about-text"
      />

      {/* Optional Children Wrapper */}
      {children && (
        <div
          className={styles.childrenWrapper}
          style={{ ...(elements["childrenWrapper"]?.style || {}) }}
          data-element-id="about-children"
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
