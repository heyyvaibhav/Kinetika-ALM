import React, { useState } from "react";
import { AES } from "crypto-js";
import "../Login/Login.css"; // Import a custom CSS file if needed
// import { FiEye, FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css";
import { NavLink, useNavigate } from "react-router-dom";

import Environment from "../../environment.js";
import { forgotPassword } from "../../Service.js";
import Loading from "../Templates/Loading.js";

// const server_url = Environment.server_url;
const secretKey = Environment.crypto_js_key;

const Forgot_Password = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // State for storing email
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await forgotPassword(`/forgot-password/${email}`);

      // const fetchedResponse = await response.json();

      if (response) {
        const encryptedData = AES.encrypt(email, secretKey).toString();
        const encodedEncryptedData = encodeURIComponent(encryptedData);
        setLoading(false);
        navigate(
          `/password-recovery/${encodeURIComponent(encodedEncryptedData)}`
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error("An error occurred. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <section style={{ height: "100%" }}>
      <div className="container-fluid h-100">

          <div className="col-6-5 d-flex flex-column justify-content-center align-items-center" style={{position: "absolute", top: "50%", transform: "translateY(-50%) translateX(-50%)", left:"50%"}}>
            <form
              style={{ padding: "20px", background: "#fff", borderRadius: "10px",}}
              className="d-flex flex-column mb-0 form-width pt-5"
              onSubmit={handleSubmit} // Add onSubmit handler
            >
              <p className="bolder h5 mt-2">Forgot Password</p>
              <p className="sub-para">
                No worries, we'll send a recovery link to your email.
              </p>
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
              <button
                type="submit"
                style={{ backgroundColor: "#1d3557", fontSize: "small" }}
                className="btn btn-primary mt-4 mb-2"
              >
                Send a recovery link
              </button>

              <p className="text-center mt-4 ">
                Back to?
                <strong>
                  <NavLink to={"/"}> &nbsp;Login</NavLink>
                </strong>
              </p>
            </form>
          </div>
      </div>

      {/* <Loading show={loading} /> */}
      {/* Toast Container to show toasts */}
      <ToastContainer />
    </section>
  );
};

export default Forgot_Password;
