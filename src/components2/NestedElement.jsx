import React from "react";
import { useDrag, useDrop } from "react-dnd";

const ELEMENT_TYPE = "ELEMENT";

function NestedElement({ element, onEdit, moveElement, parentId }) {
  const ref = React.useRef(null);

  const [, drag] = useDrag({
    type: ELEMENT_TYPE,
    item: { id: element.id, parentId },
  });

  const [, drop] = useDrop({
    accept: ELEMENT_TYPE,
    hover(item, monitor) {
      if (item.id === element.id) return;
      if (item.parentId !== parentId) return; // Only reorder within same block

      moveElement(parentId, item.id, element.id);
      item.id = element.id; // update dragged item id to avoid rapid reorder
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ padding: 4, border: "1px dashed #aaa", marginBottom: 4, cursor: "move" }}
      onDoubleClick={() => onEdit(element)}
      title="Double click to edit"
    >
      {element.type === "image" ? (
        <img src={element.src} alt={element.alt || ""} style={{ maxWidth: "100%" }} />
      ) : (
        <div>{element.content}</div>
      )}
    </div>
  );
}

export default NestedElement;
