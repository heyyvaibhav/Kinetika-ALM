import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom"; // Import Outlet
import "./MainPage.css"; // For additional styling
import { ToastContainer } from "react-toastify";
// import Header from "./Header/Header";
import { GiHamburgerMenu } from "react-icons/gi";

const MainPage = () => {
  const [menuVisible, setMenuVisible] = useState(false); // State to control menu visibility on smaller screens

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden container-fluid h-100">
      <div className="row h-100">
        {/* Left-side Menu */}
        <div
          className={`col-lg-2  p-0 ${
            menuVisible ? "d-block position-absolute menuMobile" : "d-none d-lg-block"
          }`}
        >
          <Sidebar open={menuVisible} closeMenu={() => setMenuVisible(false)}/>
        </div>

        {/* Right-side Outlet */}
        <div
          className={`w-full col-12 col-lg-10 p-0 ${menuVisible ? "blur" : ""}`}
          style={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
            backgroundColor: "rgb(247, 248, 246)",
            transition: "margin-left 0.3s ease",
            objectFit: "cover",
          }}
        >
          {/* Mobile Menu Toggle Button */}
          <button
            className="btn d-lg-none position-relative"
            style={{ top: "1em", left: "1.5em", 
             }}
            onClick={toggleMenu}
          >
            {menuVisible ? "" : <GiHamburgerMenu />}
          </button>
          <Outlet />
          {/* Dynamically renders child routes */}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
