import React from 'react';
import PropTypes from 'prop-types';
import './SideBar.css';

export default function SideBar({ options, selectedIds, onSelect }) {
  return (
    <aside className="sidebar" aria-label="Component selection sidebar">
      <h3>Select the components that you want</h3>
      <ul className="sidebar__list">
        {options.map((option) => (
          <li
            key={option.id}
            tabIndex={0}
            onClick={() => onSelect(option.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelect(option.id);
              }
            }}
            className={
              selectedIds.includes(option.id)
                ? 'sidebar__list-item sidebar__list-item--active'
                : 'sidebar__list-item'
            }
            aria-pressed={selectedIds.includes(option.id)}
            role="button"
          >
            {option.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}

SideBar.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string.isRequired, name: PropTypes.string.isRequired }),
  ).isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
};
