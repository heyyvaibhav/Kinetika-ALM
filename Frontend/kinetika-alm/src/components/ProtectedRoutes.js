import { Navigate } from "react-router-dom";
import { useRole } from "./RoleContext";
import { toast } from "react-toastify";
import Loading from "./Templates/Loading";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role } = useRole();

  const callWarning = () => {
    toast.warning("User Not allowed to access this page");
  };

  // Check if the token or relevant auth info exists in localStorage
  const token = localStorage.getItem("token"); // Replace 'authToken' with the correct key

  // If no token is found in localStorage, redirect to the login page
  if (!token) {
    // console.log("No authentication token found, redirecting to login.");
    return <Navigate to="/" />;
  }

  // Check if the role is still being fetched
  if (!role) {
    // console.log("Role not available yet");
    return <div><Loading></Loading></div>; // Show a loading spinner while role is being fetched
  }

  // Check if the current role is in the list of allowed roles
  const isAuthorized = allowedRoles.includes(role);

  // Render children (like MainPage) only if the user is authorized
  return isAuthorized ? children : callWarning();
};

export default ProtectedRoute;
