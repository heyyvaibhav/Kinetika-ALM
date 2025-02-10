import React from 'react';
import { NavLink } from 'react-router-dom';
import { useRole } from "../RoleContext"; // Import useRole to get the current role
import './Sidebar.css';

function Sidebar({ open, closeMenu }) {

  const userType = localStorage.getItem("UserType");

  console.log(userType);
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/kinetikalogo.png" alt="Logo" width="100" style={{borderRadius:"10px"}}/>
        <h2>Kinetika ALM</h2>
      </div>
      <nav>
        <NavLink to={"board"} style={{display:"flex", alignItems:"center"}} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/board.svg' style={{width: "24px", height:"24px", marginRight:"1em"}} />
          Board
        </NavLink>
        <NavLink to={"list"} style={{display:"flex", alignItems:"center"}} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/list.svg' style={{width: "24px", height:"24px", marginRight:"1em"}} />
          List
        </NavLink>
        {(userType == "1" || userType == "2") && (
          <NavLink to={"users"} style={{display:"flex", alignItems:"center"}} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/users.svg' style={{width: "24px", height:"24px", marginRight:"1em"}} />
          Users
        </NavLink>
        )}
        <NavLink to={"project"} style={{display:"flex", alignItems:"center"}} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/project.svg' style={{width: "24px", height:"24px", marginRight:"1em"}} />
          Project
        </NavLink>
        <NavLink to={"project-list"} style={{display:"flex", alignItems:"center"}} className={({ isActive }) => isActive ? 'active' : ''}>
          <img src='/projectlist.svg' style={{width: "24px", height:"24px", marginRight:"1em"}} />
          Project List
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;