import React, { useState } from "react";
import "./Login.css"; 
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import { NavLink, useNavigate } from "react-router-dom";
import { setToken, API_BASE_URL } from "../../Service.js";
import { UserType } from "../DropdownOptions.js";

const server_url = API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(FiEyeOff);
  const [email, setEmail] = useState(""); // State for storing email
  const [password, setPassword] = useState(""); // State for storing password

  const handleToggle = () => {
    if (type === "password") {
      setType("text");
      setIcon(FiEye);
    } else {
      setType("password");
      setIcon(FiEyeOff);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(server_url + "login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_id: email, Password: password }),
      });

      const fetchedResponse = await response.json();

      if (response.status === 200) {
        // setToken(fetchedResponse.token);
        localStorage.setItem("token", JSON.stringify(fetchedResponse.token));
        localStorage.setItem("UserType", fetchedResponse?.UserType || null);
        localStorage.setItem("userId", JSON.stringify(fetchedResponse?.userId));
        setTimeout(() => {
          navigate("/main/board");
        }, 1000);
        toast.success("Login Successful!");
        setEmail("");
        setPassword("");
      } else {
        // console.log("Response is: ", fetchedResponse);

        toast.error(`Login Failed. ${fetchedResponse.message} `);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <section style={{ height: "100%" }} className="login-container">
      <div className="container-fluid vh-100">
        <div className="row vh-100">
          {/* Left Column */}
          <div className="vh-100 col-md-10 d-flex flex-column justify-content-center align-items-center" >
            <form
              className="d-flex flex-column mb-0 form-width pt-5"
              onSubmit={handleSubmit} // Add onSubmit handler
              style={{backgroundColor:"#fff", borderRadius:"8px", padding:"30px"}}
            >
              <p className="bolder h5 mt-2">Welcome back!</p>
              <p className="sub-para">Login to Kinetika ALM.</p>
              <hr />
              <label htmlFor="email" className="text-start mb-2 mt-3">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                className="form-control mb-2"
                id="email"
                value={email} // Set the value from state
                onChange={(e) => setEmail(e.target.value)} // Update state on change
                required
              />
              <label htmlFor="password" className="text-start mb-2">
                Password
              </label>
              <div className="password_input">
                <input
                  type={type}
                  placeholder="Enter password"
                  id="password"
                  className="form-control mb-2"
                  value={password} // Set the value from state
                  onChange={(e) => setPassword(e.target.value)} // Update state on change
                  required
                />
                <span onClick={handleToggle} style={{ cursor: "pointer" }}>
                  {type === "password" ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </span>
              </div>
              <strong className="text-end">
                <NavLink to={"/forgot-password"}>Forgot password?</NavLink>
              </strong>

              <button
                type="submit"
                style={{ backgroundColor: "#1d3557" }}
                className="btn btn-primary mt-4 mb-2"
              >
                Login
              </button>

            </form>
          </div>

        </div>
      </div>
      {/* Toast Container to show toasts */}
    </section>
  );
};

export default Login;
