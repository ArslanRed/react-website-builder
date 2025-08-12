export default function SimpleDNDBlock({ block }) {
  return (
    <div
      style={{
        border: "1px solid #270f0fff",
        padding: 8,
        backgroundColor: " #f7c2c2ff",
        userSelect: "none",
        width: "100%",  // fill parent container width
        height: "100%", // fill parent container height
        boxSizing: "border-box",
      }}
    >
      {block.type}: {block.content}
    </div>
  );
}
