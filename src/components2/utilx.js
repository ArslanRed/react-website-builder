// File: utils.js (or inside Header.jsx if you want to keep it local)
export function updateElement(elements, elementId, updates) {
  return elements.map(el => {
    if (el.id === elementId) return { ...el, ...updates };
    if (el.elements) return { ...el, elements: updateElement(el.elements, elementId, updates) };
    return el;
  });
}
