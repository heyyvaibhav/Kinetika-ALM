import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserType, logout, UserDataFromToken } from "../Service";
import { UserType } from "./DropdownOptions";
import { toast } from "react-toastify";

// Create a context for the user's role
const RoleContext = createContext();

// Export a hook to use the role context
export const useRole = () => useContext(RoleContext);

// RoleProvider component to provide role state to the app
export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const INACTIVITY_LIMIT = 30 * 60 * 1000;

  // Fetch role from UserDataFromToken
  const getRoleForAuth = () => {
    const storedRole = UserType[getUserType() - 1]?.type;

    if (storedRole) {
      setRole(storedRole);
    }
  };

  // Reset the inactivity timer when user interacts with the page
  const resetActivityTimer = () => {
    setLastActivity(Date.now());
  };

  // Log out the user when inactivity limit is reached
  const handleInactivity = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_LIMIT) {
        toast.warning("You have been logged out due to inactivity.");
        logout();
      }
    }
  };

  useEffect(() => {
    // Fetch role on component mount
    getRoleForAuth();
    const token = localStorage.getItem("token");
    // console.log("token Data: ", token);

    // Attach event listeners to track user activity
    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) =>
      window.addEventListener(event, resetActivityTimer)
    );

    // Set an interval to check for inactivity
    const interval = setInterval(handleInactivity, 1000); // Check every second

    // Cleanup on component unmount
    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetActivityTimer)
      );
      clearInterval(interval);
    };
  }, [lastActivity]); // Re-run effect when `lastActivity` changes

  return (
    <RoleContext.Provider value={{ role, setRole, getRoleForAuth }}>
      {children}
    </RoleContext.Provider>
  );
};
