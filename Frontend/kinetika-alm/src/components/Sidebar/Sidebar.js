import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="./image.png" alt="Logo" width="100"/>
        <h2>Kinetika ALM</h2>
      </div>
      <nav>
        <NavLink to="/board" className={({ isActive }) => isActive ? 'active' : ''}>
          Board
        </NavLink>
        <NavLink to="/list" className={({ isActive }) => isActive ? 'active' : ''}>
          List
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;