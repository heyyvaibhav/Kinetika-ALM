import React from "react";
import Nav from "./Nav";
import './Templates.css'

const HeaderNav = ({ name, button_name, buttonClick }) => {
    return (
      <div
        style={{ 
          width: "100%", 
          display: "flex", 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "center", 
          backgroundColor: "#fff", 
          padding: "1em 1em" 
        }}
      >
        <h2 style={{  fontWeight: "bold", margin : "0" }}>{name}</h2>
        <div
          style={{ 
            display: "flex", 
            flexDirection: "row", 
            justifyContent: "flex-start", 
            alignItems: "center" 
          }}
        >
          <div style={{ borderRight : "1px solid #ddd", marginRight: "0.8em"}}><button style={{margin:"0.8em"}} onClick={buttonClick}>{button_name}</button></div>
          <Nav />
        </div>
      </div>
    );
  };
  

export default HeaderNav;
