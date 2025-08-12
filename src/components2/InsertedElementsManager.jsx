import React, { useState, useCallback } from "react";
import InsertedElement from "./InsertedElement";
import NestedElement from "./NestedElement";
import RichElementModal from "./RichElementModal";

export default function InsertedElementsManager({ initialElements = [], onChange }) {
  const [elements, setElements] = useState(initialElements);
  const [editingElement, setEditingElement] = useState(null);

  // Update elements and notify parent if needed
  const updateElements = useCallback(
    (newElements) => {
      setElements(newElements);
      if (onChange) onChange(newElements);
    },
    [onChange]
  );

  // Open modal for new or existing element
  const openEditModal = (element = null, type = "link") => {
    if (element) {
      setEditingElement(element);
    } else {
      setEditingElement({ id: null, type, text: "", url: "" });
    }
  };

  // Save (insert or update)
  const onSaveElement = (data) => {
    if (!editingElement) return;

    if (!editingElement.id) {
      // Insert new element
      updateElements([...elements, { ...data, id: `el_${Date.now()}` }]);
    } else {
      // Update existing element
      updateElements(
        elements.map((el) => (el.id === editingElement.id ? { ...el, ...data } : el))
      );
    }
    setEditingElement(null);
  };

  // Delete element by id
  const onDeleteElement = (id) => {
    updateElements(elements.filter((el) => el.id !== id));
  };

  // Move element by drag & drop (reorder)
  const moveElement = (parentId, draggedId, hoverId) => {
    const draggedIndex = elements.findIndex((el) => el.id === draggedId);
    const hoverIndex = elements.findIndex((el) => el.id === hoverId);
    if (draggedIndex < 0 || hoverIndex < 0) return;

    const updated = [...elements];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(hoverIndex, 0, removed);

    updateElements(updated);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 10, borderRadius: 4 }}>
      <h3>Inserted Elements</h3>

      {/* Buttons to add new elements */}
      <div style={{ marginBottom: 10 }}>
        {["link", "button", "image", "icon"].map((type) => (
          <button
            key={type}
            onClick={() => openEditModal(null, type)}
            style={{ marginRight: 8 }}
          >
            + Add {type}
          </button>
        ))}
      </div>

      {/* List of inserted elements with drag/drop */}
      <div>
        {elements.length === 0 && <p>No elements inserted yet.</p>}
        {elements.map((element) => (
          <NestedElement
            key={element.id}
            element={element}
            parentId={null}
            moveElement={moveElement}
            onEdit={() => openEditModal(element)}
          >
            <InsertedElement
              element={element}
              selected={false}
              onSelect={() => openEditModal(element)}
              onEdit={() => openEditModal(element)}
            />
            <button
              onClick={() => onDeleteElement(element.id)}
              style={{ marginLeft: 8, color: "red", cursor: "pointer" }}
            >
              Delete
            </button>
          </NestedElement>
        ))}
      </div>

      {/* Modal for adding or editing */}
      {editingElement && (
        <RichElementModal
          element={editingElement}
          onSave={onSaveElement}
          onClose={() => setEditingElement(null)}
        />
      )}
    </div>
  );
}
