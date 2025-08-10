export const generateJSXString = (componentData) => {
  if (typeof componentData === "string") {
    // already raw JSX string
    return componentData;
  }

  // Generate JSX dynamically from items array
  const jsx = componentData.items
    .map((item) => {
      if (item.type === "text") {
        return `<div className="text-item">${item.content}</div>`;
      }
      if (item.type === "image") {
        return `<img src="${item.src}" alt="${item.alt || ""}" />`;
      }
      // Handle nested grids
      if (item.type === "nested") {
        return `<div className="nested-grid">
          ${generateJSXString(item)}
        </div>`;
      }
      return `<div className="custom-item">${item.content || ""}</div>`;
    })
    .join("\n");

  return `export default function GeneratedComponent() {
  return (
    <div className="grid-container">
      ${jsx}
    </div>
  );
}`;
};

export const generateStaticHTML = (componentData) => {
  if (typeof componentData === "string") {
    return `<div>${componentData}</div>`;
  }

  return `<div class="grid-container">
${componentData.items
  .map((item) => {
    if (item.type === "text") return `<div class="text-item">${item.content}</div>`;
    if (item.type === "image") return `<img src="${item.src}" alt="${item.alt || ""}" />`;
    if (item.type === "nested") return `<div class="nested-grid">${generateStaticHTML(item)}</div>`;
    return `<div class="custom-item">${item.content || ""}</div>`;
  })
  .join("\n")}
</div>`;
};

export const generateCSS = () => {
  return `.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 10px;
}
.text-item {
  font-size: 16px;
}
.image-item {
  max-width: 100%;
}
.nested-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
}`;
};
