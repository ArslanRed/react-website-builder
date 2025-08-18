import React, { useRef } from "react";
import PropTypes from "prop-types";

/**
 * Generic EditableImage component
 * Works for any component in your editor
 */
export default function EditableImage({
  src,
  alt = "",
  onChange,
  style = {},
  className = "",
  imgClassName = "",
  labelText = "Change Image", // customizable label text
  ...rest
}) {
  const inputId = useRef(`upload-${Math.random().toString(36).substr(2, 9)}`);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange && onChange(reader.result); // send base64 up
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...style,
      }}
      className={className}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={imgClassName}
          style={{ maxWidth: "100%", display: "block", borderRadius: 4 }}
        />
      ) : (
        <div
          style={{
            padding: "20px",
            border: "1px dashed gray",
            textAlign: "center",
            width: "100%",
            borderRadius: 4,
          }}
        >
          No Image
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        id={inputId.current}
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <label
        htmlFor={inputId.current}
        style={{
          cursor: "pointer",
          color: "#1976d2",
          fontWeight: "500",
          marginTop: 8,
          padding: "4px 8px",
          borderRadius: 4,
          background: "#f0f0f0",
          textAlign: "center",
          display: "inline-block",
        }}
      >
        {labelText}
      </label>
    </div>
  );
}

EditableImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
  imgClassName: PropTypes.string,
  labelText: PropTypes.string,
};
