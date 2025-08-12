import React, { useState, useEffect } from "react";

const EMPTY_ELEMENT = { type: "link", text: "", url: "", preview: "" };

export default function RichElementModal({ 
  element, 
  onSave, 
  onClose 
}) {
  const [formData, setFormData] = useState(element || EMPTY_ELEMENT);

  useEffect(() => {
    setFormData(element || EMPTY_ELEMENT);
  }, [element]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text) {
      alert("Text is required");
      return;
    }
    onSave(formData);
  };

  if (!element) return null;

  return (
    <div 
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100000,
      }}
      onClick={onClose}
    >
      <form 
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 6,
          width: 300,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h3>{element.id ? "Edit" : "Insert"} {formData.type}</h3>

        <label>
          Text:
          <input 
            type="text" 
            name="text" 
            value={formData.text} 
            onChange={handleChange} 
            required
            autoFocus
          />
        </label>

        {(formData.type === "link" || formData.type === "button") && (
          <label>
            URL:
            <input 
              type="url" 
              name="url" 
              value={formData.url || ""} 
              onChange={handleChange} 
              placeholder="https://example.com"
            />
          </label>
        )}

        {formData.type === "image" && (
          <label>
            Image URL:
            <input 
              type="url" 
              name="url" 
              value={formData.url || ""} 
              onChange={handleChange} 
              placeholder="https://image-url.com/img.jpg"
            />
          </label>
        )}

        {formData.type === "icon" && (
          <label>
            Icon Name:
            <input 
              type="text" 
              name="text" 
              value={formData.text} 
              onChange={handleChange} 
              placeholder="e.g. fa-star"
            />
          </label>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
