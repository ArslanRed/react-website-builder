import React from "react";

function RenderElements({ elements, parentWidth }) {
  if (!elements || elements.length === 0) return null;

  return elements.map((el) => {
    const Tag = el.tag || "div";

    return (
      <Tag
        key={el.id}
        style={{
          ...el.style,
          maxWidth: parentWidth ? `${parentWidth - 20}px` : "100%", // leave padding space
          overflowWrap: "break-word",
        }}
      >
        {el.content}
        {el.elements && <RenderElements elements={el.elements} parentWidth={parentWidth} />}
      </Tag>
    );
  });
}

export default function SimpleDNDBlock({ block }) {
  if (block.type === "component" && block.component) {
    const Component = block.component;
    return <Component elements={block.elements} style={block.style} />;
  }

  const Tag = block.tag || "div";

  return (
    <Tag
  style={{
    boxSizing: "border-box",
    width: block.width === "auto" ? "auto" : block.width,
    height: block.height === "auto" ? "auto" : block.height,
    minWidth: 50,
    minHeight: 30,
    overflow: "visible", // allow content to expand naturally
    ...block.style,
  }}
>
  {typeof block.content === "string" && block.content}
  {block.elements && <RenderElements elements={block.elements} />}
</Tag>

  );
}
