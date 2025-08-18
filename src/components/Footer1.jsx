import React from 'react';
import PropTypes from 'prop-types';
import EditableText from './EditableText';
import styles from '../styles/Footer1.module.css';

function Footer1({
  title,
  onTitleChange,
  navItems = [],
  onNavItemChange = () => {},
  copyright,
  onCopyrightChange,
  style = {},
  elements = {},
}) {
  return (
    <footer
      className={styles.footer}
      style={{ ...(style || {}), ...(elements['footer']?.style || {}) }}
      data-element-id="footer"
    >
      {/* Footer Title / Logo */}
      <EditableText
        tag="h3"
        text={title}
        onChange={onTitleChange}
        className={styles.title}
        data-element-id="footer-title"
        style={{ ...(elements['title']?.style || {}), ...(elements['title']?.textStyle || {}) }}
      />

      {/* Footer Navigation */}
      {navItems.length > 0 && (
        <ul
          className={styles.navList}
          data-element-id="footer-nav"
          style={{ ...(elements['navList']?.style || {}) }}
        >
          {navItems.map((item, index) => (
            <li
              key={item.id || index}
              className={styles.navItem}
              style={{ ...(elements[`navItem-${index}`]?.style || {}) }}
              data-element-id={`footer-navItem-${index}`}
            >
              <EditableText
                tag="a"
                text={item.content}
                onChange={(val) => onNavItemChange(index, val)}
                className={styles.navLink}
                style={{ ...(elements[`navItem-${index}`]?.style || {}), ...(elements[`navItem-${index}`]?.textStyle || {}) }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Optional Copyright / Credits */}
      {copyright && (
        <EditableText
          tag="p"
          text={copyright}
          onChange={onCopyrightChange}
          className={styles.copyright}
          data-element-id="footer-copyright"
          style={{ ...(elements['copyright']?.style || {}), ...(elements['copyright']?.textStyle || {}) }}
        />
      )}
    </footer>
  );
}

Footer1.propTypes = {
  title: PropTypes.string,
  onTitleChange: PropTypes.func,
  navItems: PropTypes.array,
  onNavItemChange: PropTypes.func,
  copyright: PropTypes.string,
  onCopyrightChange: PropTypes.func,
  style: PropTypes.object,
  elements: PropTypes.object,
};

export default Footer1;
