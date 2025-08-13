const defaultElements = [
  { id: "icon_1", content: "🔷" },
  { id: "site_title", content: "My Site Title" },
  { id: "nav_1", content: ["Home", "About", "Services", "Contact"] },
  { id: "logo_name", content: "LogoName" },
];

export default function Header({ style, elements }) {
  const elems = elements && elements.length > 0 ? elements : defaultElements;

  return (
    <header
      style={{
        ...style,
        backgroundColor: "#1a1f36",
        padding: "1rem 3rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
        borderRadius: "10px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#eee",
      }}
    >
      {/* Left: Icon + Logo Name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          cursor: "default",
          userSelect: "none",
        }}
      >
        <div
          style={{
            fontSize: "2rem",
            color: "#4fc3f7",
            fontWeight: "900",
            lineHeight: 1,
          }}
        >
          {elems[0].content}
        </div>
        <span
          style={{
            fontWeight: "700",
            fontSize: "1.2rem",
            letterSpacing: "1px",
            color: "#4fc3f7",
          }}
        >
          {elems[3].content}
        </span>
      </div>

      {/* Center: Site Name */}
      <h1
        style={{
          margin: 0,
          fontSize: "1.9rem",
          fontWeight: "800",
          letterSpacing: "2px",
          textAlign: "center",
          flexGrow: 1,
          color: "#f0f0f0",
          userSelect: "text",
        }}
      >
        {elems[1].content}
      </h1>

      {/* Right: Navigation */}
      <nav
        style={{
          display: "flex",
          gap: "1.8rem",
          fontWeight: "600",
          fontSize: "1rem",
          userSelect: "none",
          color: "#bbb",
        }}
      >
        {elems[2].content.map((item, i) => (
          <a
            key={i}
            href="#"
            style={{
              textDecoration: "none",
              color: "#4fc3f7",
              padding: "0.4rem 0.8rem",
              borderRadius: "5px",
              transition: "background-color 0.3s ease, color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4fc3f7";
              e.currentTarget.style.color = "#1a1f36";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#4fc3f7";
            }}
            onClick={(e) => e.preventDefault()}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
