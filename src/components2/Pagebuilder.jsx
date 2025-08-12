import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

// Constants
const ITEM_TYPE = "BLOCK";
const CONTAINER_TYPES = ["section", "aside"];
const LEAF_TYPES = ["heading", "paragraph"];

// Generate unique IDs
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Initial blocks
const initialBlocks = [
  {
    id: "1",
    type: "section",
    styles: {
      border: "1px solid #ccc",
      padding: "10px",
      marginBottom: "10px",
      minHeight: 100,
      width: "100%",
      position: "relative",
      backgroundColor: "white",
    },
    children: [
      {
        id: "1-1",
        type: "heading",
        content: "Editable Heading",
        styles: { color: "blue" },
        inserts: [],
      },
      {
        id: "1-2",
        type: "paragraph",
        content: "Editable paragraph text.",
        styles: {},
        inserts: [],
      },
    ],
  },
  {
    id: "2",
    type: "aside",
    styles: {
      border: "1px solid #aaa",
      padding: "10px",
      marginBottom: "10px",
      minHeight: 50,
      width: "100%",
      position: "relative",
      backgroundColor: "#f9f9f9",
    },
    children: [
      {
        id: "2-1",
        type: "paragraph",
        content: "Aside paragraph here",
        styles: {},
        inserts: [],
      },
    ],
  },
];

// Helpers: find, update, remove, flatten, move blocks

function findBlockAndParent(blocks, id, parent = null) {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === id) return { block: b, parent, index: i, blocks };
    if (b.children) {
      const res = findBlockAndParent(b.children, id, b);
      if (res) return res;
    }
  }
  return null;
}

function updateBlockInTree(blocks, id, updateFn) {
  let updated = false;
  const newBlocks = blocks.map((b) => {
    if (b.id === id) {
      updated = true;
      return updateFn(b);
    }
    if (b.children) {
      const updatedChildren = updateBlockInTree(b.children, id, updateFn);
      if (updatedChildren !== b.children) {
        updated = true;
        return { ...b, children: updatedChildren };
      }
    }
    return b;
  });
  return updated ? newBlocks : blocks;
}

function removeBlockById(blocks, id) {
  let updated = false;
  const filtered = blocks
    .filter((b) => b.id !== id)
    .map((b) => {
      if (b.children) {
        const newChildren = removeBlockById(b.children, id);
        if (newChildren !== b.children) updated = true;
        return { ...b, children: newChildren };
      }
      return b;
    });
  if (filtered.length !== blocks.length) updated = true;
  return updated ? filtered : blocks;
}

function flattenBlocks(blocks) {
  let flat = [];
  blocks.forEach((b) => {
    flat.push(b);
    if (b.children) {
      flat = flat.concat(flattenBlocks(b.children));
    }
  });
  return flat;
}

function moveBlockInTree(blocks, dragId, hoverId) {
  if (dragId === hoverId) return blocks;

  const dragInfo = findBlockAndParent(blocks, dragId);
  const hoverInfo = findBlockAndParent(blocks, hoverId);

  if (!dragInfo || !hoverInfo) return blocks;

  const { block: dragBlock, parent: dragParent, index: dragIndex } = dragInfo;
  const { parent: hoverParent, index: hoverIndex } = hoverInfo;

  const dragSiblings = dragParent ? dragParent.children : blocks;
  const hoverSiblings = hoverParent ? hoverParent.children : blocks;

  // same parent
  if (dragSiblings === hoverSiblings) {
    const newSiblings = [...dragSiblings];
    newSiblings.splice(dragIndex, 1);
    newSiblings.splice(hoverIndex, 0, dragBlock);

    if (dragParent) {
      return updateBlockInTree(blocks, dragParent.id, () => ({
        ...dragParent,
        children: newSiblings,
      }));
    } else {
      return newSiblings;
    }
  } else {
    // different parents
    const newDragSiblings = [...dragSiblings];
    newDragSiblings.splice(dragIndex, 1);

    const newHoverSiblings = [...hoverSiblings];
    newHoverSiblings.splice(hoverIndex, 0, dragBlock);

    let newBlocks = blocks;

    if (dragParent) {
      newBlocks = updateBlockInTree(newBlocks, dragParent.id, () => ({
        ...dragParent,
        children: newDragSiblings,
      }));
    } else {
      newBlocks = newDragSiblings;
    }

    if (hoverParent) {
      newBlocks = updateBlockInTree(newBlocks, hoverParent.id, () => ({
        ...hoverParent,
        children: newHoverSiblings,
      }));
    } else {
      newBlocks = newHoverSiblings;
    }

    return newBlocks;
  }
}

// InsertedElement component for inline rich elements

function InsertedElement({
  element,
  onEdit,
  selected,
  onSelect,
  style = {},
}) {
  const baseStyle = {
    cursor: "pointer",
    padding: element.type === "button" ? "2px 8px" : undefined,
    margin: element.type === "button" ? "0 4px" : undefined,
    color: element.type === "link" ? "blue" : undefined,
    textDecoration: element.type === "link" ? "underline" : undefined,
    borderRadius: element.type === "button" ? 4 : undefined,
    border: selected ? "2px solid #4f46e5" : "none",
    backgroundColor:
      element.type === "button" ? "#4f46e5" : "transparent",
    color: element.type === "button" ? "white" : baseStyle?.color,
    display: "inline-block",
    ...style,
  };

  if (element.type === "image") {
    return (
      <img
        src={element.preview || element.url}
        alt={element.text || "image"}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(element.id);
          onEdit(element);
        }}
        style={{
          maxWidth: 120,
          maxHeight: 80,
          borderRadius: 4,
          cursor: "pointer",
          outline: selected ? "2px solid #4f46e5" : "none",
          ...style,
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSelect(element.id);
            onEdit(element);
          }
        }}
      />
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
        onEdit(element);
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSelect(element.id);
          onEdit(element);
        }
      }}
      style={baseStyle}
      role="button"
      aria-pressed={selected}
    >
      {element.text || element.url || "?"}
    </span>
  );
}

// Inline modal for inserting/editing rich elements

function InlineEditModal({
  visible,
  onClose,
  onSave,
  mode,
  type,
  initialData = {},
}) {
  const [url, setUrl] = useState(initialData.url || "");
  const [text, setText] = useState(initialData.text || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialData.preview || "");

  useEffect(() => {
    setUrl(initialData.url || "");
    setText(initialData.text || "");
    setPreview(initialData.preview || "");
    setFile(null);
  }, [visible, initialData]);

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const blobUrl = URL.createObjectURL(f);
      setPreview(blobUrl);
    }
  };

  const handleSave = () => {
    if (type === "image" && file) {
      onSave({ type, file, preview });
    } else {
      onSave({ type, url, text, preview });
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: "fixed",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -30%)",
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: 6,
        padding: 16,
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        minWidth: 280,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: "1.25rem" }}>
        {mode === "insert" ? `Insert ${type}` : `Edit ${type}`}
      </h3>

      {(type === "link" || type === "button" || type === "icon") && (
        <>
          <label style={{ display: "block", marginBottom: 6 }}>
            Text:
            <input
              autoFocus
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: "100%",
                padding: 6,
                marginTop: 4,
                boxSizing: "border-box",
              }}
            />
          </label>

          {(type === "link" || type === "icon") && (
            <label style={{ display: "block", marginBottom: 6 }}>
              URL:
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                style={{
                  width: "100%",
                  padding: 6,
                  marginTop: 4,
                  boxSizing: "border-box",
                }}
              />
            </label>
          )}
        </>
      )}

      {type === "image" && (
        <>
          <label style={{ display: "block", marginBottom: 6 }}>
            Upload Image:
            <input type="file" accept="image/*" onChange={onFileChange} />
          </label>
          {preview && (
            <img
              alt="preview"
              src={preview}
              style={{
                maxWidth: "100%",
                borderRadius: 4,
                marginTop: 8,
                border: "1px solid #ccc",
              }}
            />
          )}
          <label style={{ display: "block", marginTop: 12 }}>
            Or enter image URL:
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              style={{
                width: "100%",
                padding: 6,
                marginTop: 4,
                boxSizing: "border-box",
              }}
            />
          </label>
        </>
      )}

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button
          onClick={onClose}
          style={{
            marginRight: 8,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={
            (type === "image" && !file && !url) ||
            ((type === "link" || type === "icon") && (!text || !url)) ||
            (type === "button" && !text)
          }
          style={{
            padding: "6px 12px",
            cursor: "pointer",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          {mode === "insert" ? "Insert" : "Save"}
        </button>
      </div>
    </div>
  );
}

// BlockRenderer component

function BlockRenderer({
  block,
  blocks,
  moveBlock,
  findBlock,
  onUpdateBlock,
  onDeleteBlock,
  onInsertRichElement,
  selectedBlockId,
  setSelectedBlockId,
  editingElement,
  setEditingElement,
  editingElementBlockId,
  setEditingElementBlockId,
  level = 0,
}) {
  const ref = useRef(null);
  const isContainer = CONTAINER_TYPES.includes(block.type);
  const isSelected = selectedBlockId === block.id;

  // Keyboard navigation handlers
  const onKeyDown = (e) => {
    if (e.target !== ref.current) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const flatBlocks = flattenBlocks(blocks);
      const currentIndex = flatBlocks.findIndex((b) => b.id === selectedBlockId);
      if (currentIndex === -1) return;
      let newIndex;
      if (e.key === "ArrowDown") newIndex = Math.min(flatBlocks.length - 1, currentIndex + 1);
      else if (e.key === "ArrowUp") newIndex = Math.max(0, currentIndex - 1);
      const newBlock = flatBlocks[newIndex];
      if (newBlock) setSelectedBlockId(newBlock.id);
    }
  };

  // Drag source
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: block.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop target
  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item) => {
      if (!ref.current) return;
      if (item.id === block.id) return;

      const dragIndex = findBlock(item.id)?.index;
      const hoverIndex = findBlock(block.id)?.index;
      if (dragIndex === hoverIndex) return;

      moveBlock(item.id, block.id);
      // Don't mutate item.id here!
    },
  });

  drag(drop(ref));

  // Editable content state for leaves
  const [localContent, setLocalContent] = useState(block.content || "");
  useEffect(() => {
    setLocalContent(block.content || "");
  }, [block.content]);

  const onInput = (e) => {
    setLocalContent(e.currentTarget.textContent);
  };

  const onBlur = () => {
    if (localContent !== block.content) {
      onUpdateBlock(block.id, (b) => ({ ...b, content: localContent }));
    }
  };

  // Inserted rich elements management
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Select block on click
  const onClickBlock = (e) => {
    e.stopPropagation();
    setSelectedBlockId(block.id);
    setSelectedElementId(null);
    setEditingElement(null);
  };

  // Insert rich element
  const onInsertClick = (type) => {
    onInsertRichElement(block.id, type);
  };

  // Edit inserted element
  const onEditElement = (element) => {
    setEditingElement(element);
    setEditingElementBlockId(block.id);
  };

  // Delete inserted element
  const onDeleteElement = (elementId) => {
    onUpdateBlock(block.id, (b) => ({
      ...b,
      inserts: b.inserts.filter((el) => el.id !== elementId),
    }));
    setSelectedElementId(null);
    setEditingElement(null);
  };

  // Styles
  const blockStyle = {
    opacity: isDragging ? 0.5 : 1,
    border: isSelected ? "2px solid #4f46e5" : block.styles.border,
    padding: block.styles.padding,
    marginBottom: block.styles.marginBottom,
    minHeight: block.styles.minHeight,
    width: block.styles.width || "auto",
    backgroundColor: block.styles.backgroundColor || "white",
    cursor: "move",
    position: "relative",
    userSelect: isSelected ? "text" : "none",
    outline: isSelected ? "2px solid #4f46e5" : "none",
    boxSizing: "border-box",
  };

  // Render for container blocks with ResizableBox wrapper
  if (isContainer) {
    return (
      <ResizableBox
        width={parseInt(block.styles.width) || 300}
        height={block.styles.minHeight || 100}
        minConstraints={[100, 50]}
        maxConstraints={[1200, 1200]}
        resizeHandles={["se"]}
        onResizeStop={(e, data) => {
          onUpdateBlock(block.id, (b) => ({
            ...b,
            styles: {
              ...b.styles,
              width: data.size.width + "px",
              minHeight: data.size.height,
            },
          }));
        }}
        handle={
          <span
            style={{
              position: "absolute",
              width: 20,
              height: 20,
              right: 0,
              bottom: 0,
              cursor: "se-resize",
              backgroundColor: "#4f46e5",
              borderRadius: "0 0 4px 0",
              zIndex: 10,
            }}
          />
        }
      >
        <div
          ref={ref}
          tabIndex={0}
          style={{ ...blockStyle, height: "100%", paddingLeft: 16, paddingRight: 16 }}
          onClick={onClickBlock}
          onKeyDown={onKeyDown}
          aria-label={`${block.type} container block`}
          role="region"
        >
          {block.children &&
            block.children.map((child) => (
              <BlockRenderer
                key={child.id}
                block={child}
                blocks={blocks}
                moveBlock={moveBlock}
                findBlock={findBlock}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                onInsertRichElement={onInsertRichElement}
                selectedBlockId={selectedBlockId}
                setSelectedBlockId={setSelectedBlockId}
                editingElement={editingElement}
                setEditingElement={setEditingElement}
                editingElementBlockId={editingElementBlockId}
                setEditingElementBlockId={setEditingElementBlockId}
                level={level + 1}
              />
            ))}

          {/* Delete block button */}
          {isSelected && (
            <button
              aria-label="Delete block"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBlock(block.id);
              }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: 4,
                padding: "2px 6px",
                cursor: "pointer",
                fontSize: 14,
                zIndex: 11,
              }}
            >
              ×
            </button>
          )}
        </div>
      </ResizableBox>
    );
  }

  // Leaf blocks (heading/paragraph) with editable content
  return (
    <div
      ref={ref}
      tabIndex={0}
      style={blockStyle}
      onClick={onClickBlock}
      onKeyDown={onKeyDown}
      aria-label={`${block.type} block`}
      role="region"
    >
      {(block.type === "heading" || block.type === "paragraph") && (
        <>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
            onBlur={onBlur}
            style={{
              outline: "none",
              minHeight: "1.2em",
              color: block.styles.color || "inherit",
              userSelect: "text",
              cursor: "text",
              whiteSpace: "pre-wrap",
            }}
            aria-multiline="true"
          >
            {localContent}
          </div>

          {/* Render inserted rich elements inline */}
          <div style={{ marginTop: 8 }}>
            {(block.inserts || []).map((el) => (
              <InsertedElement
                key={el.id}
                element={el}
                selected={selectedElementId === el.id}
                onSelect={setSelectedElementId}
                onEdit={onEditElement}
              />
            ))}
          </div>

          {/* Insert rich elements controls */}
          {isSelected && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {["link", "button", "image", "icon"].map((type) => (
                <button
                  key={type}
                  onClick={(e) => {
                    e.stopPropagation();
                    onInsertClick(type);
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "4px 8px",
                    fontSize: 14,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  Insert {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete block button */}
      {isSelected && (
        <button
          aria-label="Delete block"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBlock(block.id);
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: 4,
            padding: "2px 6px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// Main PageBuilder component

export default function PageBuilder() {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [editingElement, setEditingElement] = useState(null);
  const [editingElementBlockId, setEditingElementBlockId] = useState(null);

  // Find block helper
  const findBlock = useCallback(
    (id) => {
      const flat = flattenBlocks(blocks);
      const index = flat.findIndex((b) => b.id === id);
      return { block: flat[index], index };
    },
    [blocks]
  );

  // Move block handler
  const moveBlock = useCallback(
    (dragId, hoverId) => {
      setBlocks((prev) => moveBlockInTree(prev, dragId, hoverId));
      setSelectedBlockId(dragId);
    },
    []
  );

  // Update block by id
  const onUpdateBlock = useCallback(
    (id, updateFn) => {
      setBlocks((prev) => updateBlockInTree(prev, id, updateFn));
    },
    []
  );

  // Delete block by id
  const onDeleteBlock = useCallback(
    (id) => {
      setBlocks((prev) => removeBlockById(prev, id));
      if (selectedBlockId === id) setSelectedBlockId(null);
    },
    [selectedBlockId]
  );

  // Insert rich element modal open
  const onInsertRichElement = (blockId, type) => {
    setEditingElement({ type, id: null, text: "", url: "", preview: "" });
    setEditingElementBlockId(blockId);
  };

  // Modal close
  const closeModal = () => {
    setEditingElement(null);
    setEditingElementBlockId(null);
  };

  // Save inserted or edited element
  const onSaveInsertedElement = (data) => {
    if (!editingElementBlockId) return;
    if (!editingElement) return;

    if (!editingElement.id) {
      // New insert
      const newInsert = {
        id: generateId(),
        ...data,
      };
      onUpdateBlock(editingElementBlockId, (b) => ({
        ...b,
        inserts: [...(b.inserts || []), newInsert],
      }));
    } else {
      // Edit existing insert
      onUpdateBlock(editingElementBlockId, (b) => ({
        ...b,
        inserts: b.inserts.map((el) =>
          el.id === editingElement.id ? { ...el, ...data } : el
        ),
      }));
    }
    closeModal();
  };

  // Add new block button handler
  const addBlock = (type) => {
    const newBlock = {
      id: generateId(),
      type,
      content:
        type === "heading"
          ? "New Heading"
          : type === "paragraph"
          ? "New paragraph"
          : "",
      styles: {
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "10px",
        minHeight: 50,
        width: "100%",
        backgroundColor: "white",
        position: "relative",
      },
      inserts: [],
      children: CONTAINER_TYPES.includes(type) ? [] : undefined,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "#eee",
          fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
          userSelect: "none",
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            width: 240,
            padding: "1rem",
            backgroundColor: "white",
            borderRight: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
            Add New Block
          </h3>
          {[...CONTAINER_TYPES, ...LEAF_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              style={{
                width: "100%",
                padding: "0.6rem",
                marginBottom: "0.5rem",
                cursor: "pointer",
                fontSize: "1rem",
                borderRadius: 4,
                border: "1px solid #ccc",
                backgroundColor: "#f9f9f9",
                userSelect: "none",
              }}
            >
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main
          style={{
            flexGrow: 1,
            padding: 20,
            overflowY: "auto",
            boxSizing: "border-box",
            outline: "none",
          }}
          tabIndex={0}
          onClick={() => setSelectedBlockId(null)}
        >
          {blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              blocks={blocks}
              moveBlock={moveBlock}
              findBlock={findBlock}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onInsertRichElement={onInsertRichElement}
              selectedBlockId={selectedBlockId}
              setSelectedBlockId={setSelectedBlockId}
              editingElement={editingElement}
              setEditingElement={setEditingElement}
              editingElementBlockId={editingElementBlockId}
              setEditingElementBlockId={setEditingElementBlockId}
            />
          ))}
        </main>

        {/* Inline edit modal */}
        <InlineEditModal
          visible={!!editingElement}
          type={editingElement?.type}
          mode={editingElement?.id ? "edit" : "insert"}
          initialData={editingElement || {}}
          onClose={closeModal}
          onSave={onSaveInsertedElement}
        />
      </div>
    </DndProvider>
  );
}
