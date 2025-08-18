import React, { useRef } from "react";
import PropTypes from "prop-types";

/* --------------------
   EditableImage
--------------------- */
export function EditableImage({
  src,
  alt = "",
  onChange,
  style = {},
  className = "",
  imgClassName = "",
  labelText = "Change Image",
  ...rest
}) {
  const inputId = useRef(`upload-${Math.random().toString(36).substr(2, 9)}`);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange && onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...style }} className={className} {...rest}>
      {src ? (
        <img src={src} alt={alt} className={imgClassName} style={{ maxWidth: "100%", display: "block", borderRadius: 4 }} />
      ) : (
        <div style={{ padding: 20, border: "1px dashed gray", textAlign: "center", width: "100%", borderRadius: 4 }}>No Image</div>
      )}

      <input type="file" accept="image/*" id={inputId.current} style={{ display: "none" }} onChange={handleChange} />
      <label htmlFor={inputId.current} style={{ cursor: "pointer", color: "#1976d2", fontWeight: 500, marginTop: 8, padding: "4px 8px", borderRadius: 4, background: "#f0f0f0", textAlign: "center", display: "inline-block" }}>
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

/* --------------------
   EditableBackground
--------------------- */
export function EditableBackground({
  src,
  onChange,
  style = {},
  className = "",
  labelText = "Change Background",
  ...rest
}) {
  const inputId = useRef(`bg-upload-${Math.random().toString(36).substr(2, 9)}`);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange && onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: src ? `url(${src})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
      className={className}
      {...rest}
    >
      <input type="file" accept="image/*" id={inputId.current} style={{ display: "none" }} onChange={handleChange} />
      <label htmlFor={inputId.current} style={{ cursor: "pointer", color: "#fff", fontWeight: 500, position: "absolute", bottom: 10, left: 10, padding: "4px 8px", borderRadius: 4, background: "rgba(0,0,0,0.5)", textAlign: "center" }}>
        {labelText}
      </label>
    </div>
  );
}

EditableBackground.propTypes = {
  src: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
  labelText: PropTypes.string,
};

export default EditableImage;
