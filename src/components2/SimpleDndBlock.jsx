import React from "react";

// Recursive renderer for nested elements
function RenderElements({ elements, parentWidth, blockId, selectedTarget, setSelectedTarget }) {
  if (!elements || elements.length === 0) return null;

  return elements.map((el) => {
    const Tag = el.tag || "div";

    const isSelected =
      selectedTarget?.type === "element" &&
      selectedTarget.blockId === blockId &&
      selectedTarget.elementId === el.id;

    return (
      <Tag
        key={el.id}
        style={{
          ...el.style,
          maxWidth: parentWidth ? `${parentWidth - 20}px` : "100%",
          overflowWrap: "break-word",
          outline: isSelected ? "2px solid blue" : "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTarget({ type: "element", blockId, elementId: el.id });
        }}
      >
        {el.content}
        {el.elements && (
          <RenderElements
            elements={el.elements}
            parentWidth={parentWidth}
            blockId={blockId}
            selectedTarget={selectedTarget}
            setSelectedTarget={setSelectedTarget}
          />
        )}
      </Tag>
    );
  });
}

export default function SimpleDNDBlock({ block, selectedTarget, setSelectedTarget }) {
  const Tag = block.tag || "div";

  const isSelected = selectedTarget?.type === "block" && selectedTarget.blockId === block.id;

  // Highlight entire block
  const blockStyle = {
    boxSizing: "border-box",
    width: block.width === "auto" ? "auto" : block.width,
    height: block.height === "auto" ? "auto" : block.height,
    minWidth: 50,
    minHeight: 30,
    overflow: "visible",
    outline: isSelected ? "2px solid blue" : "none",
    ...block.style,
  };

  if (block.type === "component" && block.component) {
    const Component = block.component;
    return (
      <div style={{ outline: isSelected ? "2px solid blue" : "none" }}>
        <Component
          elements={block.elements}
          style={block.style}
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
        />
      </div>
    );
  }

  return (
    <Tag
      style={blockStyle}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedTarget({ type: "block", blockId: block.id });
      }}
    >
      {typeof block.content === "string" && block.content}
      {block.elements && (
        <RenderElements
          elements={block.elements}
          parentWidth={block.width}
          blockId={block.id}
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
        />
      )}
    </Tag>
  );
}
