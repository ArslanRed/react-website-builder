import React from "react";
import PropTypes from "prop-types";
import EditableText from "./EditableText";
import styles from "../styles/Header1.module.css";

function Header1({
  title,
  onTitleChange,
  navItems = [],
  onNavItemChange = () => {},
  ctaItems = [],
  onCtaChange = () => {},
  style = {},          // 🔹 incoming styles from your editor
  elements = {},       // 🔹 element-level styles
}) {
  return (
    <header
      className={styles.header}
      style={{
        ...style, // 🔹 external editor styles override here
      }}
      data-element-id="header"
    >
      {/* Logo */}
      <div
        className={styles.logo}
        style={{
          flex: "0 0 auto",
          marginBottom: "0.5rem",
          ...(elements.logo?.style || {}),
        }}
        data-element-id="logo"
      >
        <EditableText
          tag="h1"
          text={title}
          onChange={onTitleChange}
          className={styles.title}
          style={{
            margin: 0,
            fontSize: "1.5rem",
            whiteSpace: "nowrap",
            ...(elements.logo?.textStyle || {}),
          }}
        />
      </div>

      {/* Navigation */}
      <nav
        className={styles.nav}
        style={{
          flex: "1 1 auto",
          ...(elements.nav?.style || {}),
        }}
        data-element-id="nav"
      >
        <ul
          className={styles.navList}
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            margin: 0,
            padding: 0,
            listStyle: "none",
            ...(elements.nav?.listStyle || {}),
          }}
        >
          {navItems.map((item, index) => (
            <li key={item.id || index}>
              <EditableText
                tag="a"
                text={item.content}
                onChange={(val) => onNavItemChange(index, val)}
                className={styles.navLink}
                style={{
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  ...(elements.nav?.itemStyle || {}),
                }}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* CTA */}
      <div
        className={styles.cta}
        style={{
          flex: "0 0 auto",
          marginTop: "0.5rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          ...(elements.cta?.style || {}),
        }}
        data-element-id="cta"
      >
        {ctaItems.map((cta, index) => (
          <EditableText
            key={cta.id || index}
            tag="a"
            text={cta.content}
            onChange={(val) => onCtaChange(index, val)}
            className={styles.ctaButton}
            style={{
              display: "inline-block",
              padding: "0.25rem 0.5rem",
              whiteSpace: "nowrap",
              ...(elements.cta?.itemStyle || {}),
            }}
          />
        ))}
      </div>
    </header>
  );
}

Header1.propTypes = {
  title: PropTypes.string,
  onTitleChange: PropTypes.func,
  navItems: PropTypes.array,
  onNavItemChange: PropTypes.func,
  ctaItems: PropTypes.array,
  onCtaChange: PropTypes.func,
  style: PropTypes.object,
  elements: PropTypes.object,
};

export default Header1;
