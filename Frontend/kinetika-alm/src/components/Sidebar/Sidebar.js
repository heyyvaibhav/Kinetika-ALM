import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRole } from "../RoleContext"; // Import useRole to get the current role
import './Sidebar.css';
import { logout } from '../../Service';

function Sidebar({ open, closeMenu }) {

  const userType = localStorage.getItem("UserType");

  return (
    <div className="sidebar">
      {open && (
        <div
          style={{ cursor: "pointer", textAlign: "end" }}
        >
          <button className="icon-button" onClick={closeMenu}>
              <h1 className="close-icon">X</h1>
            </button>
        </div>
      )}
      <div className="logo">
        <img src="/kinetikalogo.png" alt="Logo" width="100" style={{ borderRadius: "10px" }} />
        <h2>Kinetika ALM</h2>
      </div>
      <nav>
        <NavLink to={"board"} style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
          <img src='/board.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
          Board
        </NavLink>
        <NavLink to={"list"} style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
          <img src='/list.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
          List
        </NavLink>
        {(userType == "1" || userType == "2") && (
          <NavLink to={"users"} style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
            <img src='/users.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
            Users
          </NavLink>
        )}
        <NavLink to={"project-list"} style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
          <img src='/projectlist.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
          Projects
        </NavLink>
        <NavLink style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
          <img src='/logout.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
          Logout
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;