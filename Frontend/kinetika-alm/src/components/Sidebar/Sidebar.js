import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRole } from "../RoleContext"; // Import useRole to get the current role
import './Sidebar.css';
import { logout } from '../../Service';

function Sidebar({ open, closeMenu }) {

  const userType = localStorage.getItem("UserType");

  return (
    <div style={{justifyContent:"space-between"}}><div className="sidebar">
      {open && (
        <div
          className="btn d-flex justify-content-end p-1"
          onClick={closeMenu} // Close menu when clicked
          style={{ cursor: "pointer" }}
        >
          <button className="btn btn-primary">X</button>
        </div>
      )}
      <div className="logo">
        <img src="/kinetikalogo.png" alt="Logo" width="100" style={{ borderRadius: "10px" }} />
        <h2>Kinetika ALM</h2>
      </div>
      <nav>
        <NavLink to={"board"} style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/board.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
          Board
        </NavLink>
        <NavLink to={"list"} style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/list.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
          List
        </NavLink>
        {(userType == "1" || userType == "2") && (
          <NavLink to={"users"} style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''}>
            <img src='/users.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
            Users
          </NavLink>
        )}
        {/* <NavLink to={"project"} style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/project.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
          Project
        </NavLink> */}
        <NavLink to={"project-list"} style={{ display: "flex", alignItems: "center" }} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/projectlist.svg' style={{ width: "24px", height: "24px", marginRight: "1em" }} />
          Projects
        </NavLink>
      </nav>
    </div>

      <nav style={{ width:"230px" }}>
        <div onClick={logout} className="logout">
          <img src='/logout.svg' style={{ width: "24px", height: "24px", marginLeft:"-0.2em", marginRight: "0.8em"}} />
          Logout
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;