import React from 'react';
import PropTypes from 'prop-types';
import EditableText from './EditableText';
import styles from '../styles/Aside1.module.css';

function Aside1({
  title,
  onTitleChange,
  items = [],
  onItemChange = () => {},
  style = {},
  elements = {},
}) {
  return (
    <aside
      className={styles.aside}
      style={{ ...(style || {}) }}
      data-element-id="aside"
    >
      {/* Aside Title */}
      <EditableText
        tag="h3"
        text={title}
        onChange={onTitleChange}
        className={styles.title}
        data-element-id="aside-title"
        style={{ ...(elements['title']?.style || {}), ...(elements['title']?.textStyle || {}) }}
      />

      {/* List of Items */}
      <ul
        className={styles.list}
        style={{ ...(elements['list']?.style || {}) }}
        data-element-id="aside-list"
      >
        {items.map((item, index) => (
          <li
            key={item.id || index}
            className={styles.listItem}
            style={{ ...(elements[`item-${index}`]?.style || {}) }}
            data-element-id={`aside-item-${index}`}
          >
            <EditableText
              tag="span"
              text={item.content}
              onChange={(val) => onItemChange(index, val)}
              className={styles.listItemText}
              style={{ ...(elements[`item-${index}`]?.style || {}), ...(elements[`item-${index}`]?.textStyle || {}) }}
            />
          </li>
        ))}
      </ul>
    </aside>
  );
}

Aside1.propTypes = {
  title: PropTypes.string,
  onTitleChange: PropTypes.func,
  items: PropTypes.array,
  onItemChange: PropTypes.func,
  style: PropTypes.object,
  elements: PropTypes.object,
};

export default Aside1;
