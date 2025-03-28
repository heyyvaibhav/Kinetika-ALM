import React from "react";
import Nav from "./Nav";
import './Templates.css'

const HeaderNav = ({ name }) => {
    return (
      <div
        style={{ 
          width: "100%", 
          display: "flex", 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "center", 
          backgroundColor: "#F7F8F9", 
          padding: "1em 1em" 
        }}
      >
        {/* <h5>{name}</h5> */}
        <span style={{ fontSize: "1rem", fontWeight: "bold" }}>{name}</span>
        <div
          style={{ 
            display: "flex", 
            flexDirection: "row", 
            justifyContent: "flex-start", 
            alignItems: "baseline" 
          }}
        >
          <Nav />
        </div>
      </div>
    );
  };
  

export default HeaderNav;
