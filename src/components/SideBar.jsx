import React from 'react';
import './SideBar.css'
export default function Sidebar({ options, selectedId, onSelect }) {
  return (
    <aside className="sidebar">
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
              selectedId === option.id
                ? "sidebar__list-item sidebar__list-item--active"
                : "sidebar__list-item"
            }
          >
            {option.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
