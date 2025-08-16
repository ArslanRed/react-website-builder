import React, { useEffect, useRef } from 'react';

export default function EditableText({ tag = 'p', text, onChange, className = '', style = {} }) {
  const Tag = tag;
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== text) {
      ref.current.innerText = text;
    }
  }, [text]);

  const handleInput = (e) => {
    onChange(e.currentTarget.innerText);
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`${className} editable-text`}
      onInput={handleInput}
      role="textbox"
      aria-label={`Editable ${tag}`}
      tabIndex={0}
      spellCheck={false}
      style={style}
    />
  );
}
