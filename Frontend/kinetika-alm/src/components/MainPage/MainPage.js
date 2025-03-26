import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom"; // Import Outlet
import "./MainPage.css"; // For additional styling
import { ToastContainer } from "react-toastify";
// import Header from "./Header/Header";
import { GiHamburgerMenu } from "react-icons/gi";

const MainPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1000);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showButton, setShowButton] = useState(window.innerWidth < 1000);

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 1000;
      
      setShowButton(isSmallScreen);
      setMenuVisible(false);  // Always close menu on resize
      setIsSidebarOpen(!isSmallScreen);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden container-fluid h-100">
      <div className="row h-100">
        {/* Left-side Menu */}
        {!isSidebarOpen ? (
          <div>
          {/* Background Overlay with Blur Effect */}
          {menuVisible && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backdropFilter: "blur(5px)", // Applies blur effect
                backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent dark overlay
                zIndex: 9, // Keeps it behind the menu but above content
              }}
              onClick={() => setMenuVisible(false)} // Clicking outside closes menu
            ></div>
          )}
        
          {/* Sidebar Menu */}
          <div
            style={{
              display: menuVisible ? "block" : "none",
              position: "absolute",
              top: 0,
              left: 0,
              width: window.innerWidth < 500 ? "75%" : "50%", // Adjust sidebar width
              height: "100%",
              background: "#fff",
              boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)", // Box shadow effect
              padding: "1rem",
              zIndex: 10, // Ensure menu is above the blurred background
            }}
          >
            <Sidebar open={menuVisible} closeMenu={() => setMenuVisible(false)} />
          </div>
        </div>
        ) : (
          <Sidebar open={menuVisible} closeMenu={() => setMenuVisible(false)} />
        )}

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
          {showButton && !menuVisible && (
            <button
              style={{ top: "1em", left: "1.5em", zIndex:"2000", marginBottom :"-20px" , marginLeft :"20px" , height :"40px" }}
              onClick={toggleMenu}
            >
              <GiHamburgerMenu />
            </button>
          )}
          <Outlet />
          {/* Dynamically renders child routes */}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
