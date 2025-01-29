import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="./image.png" alt="Logo" width="100" style={{borderRadius:"10px"}}/>
        <h2>Kinetika ALM</h2>
      </div>
      <nav>
        <NavLink to="/board" style={{display:"flex", alignItems:"center"}} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/board.svg' style={{width: "24px", height:"24px", marginRight:"1em"}} />
          Board
        </NavLink>
        <NavLink to="/list" style={{display:"flex", alignItems:"center"}} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/list.svg' style={{width: "24px", height:"24px", marginRight:"1em"}} />
          List
        </NavLink>
        <NavLink to="/project" style={{display:"flex", alignItems:"center"}} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/project.svg' style={{width: "24px", height:"24px", marginRight:"1em"}} />
          Project
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;