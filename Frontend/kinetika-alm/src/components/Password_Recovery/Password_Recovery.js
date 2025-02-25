// import React, { useState } from "react";
import "../Login/Login.css"; // Import a custom CSS file if needed
// import { FiEye, FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";

import Environment from "../../environment.js";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CryptoJS from "crypto-js";

// const server_url = Environment.server_url;

const Password_Recovery = () => {
  const secretKey = Environment.crypto_js_key;
  const { encryptedData } = useParams();
  //   console.log("encrypted: ", encryptedData);

  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      // Decode the encrypted data from the URL
      const decodedEncryptedData = decodeURIComponent(encryptedData);

      // Decrypt the data
      const bytes = CryptoJS.AES.decrypt(decodedEncryptedData, secretKey);
      const decryptedEmail = bytes.toString(CryptoJS.enc.Utf8);

      if (decryptedEmail) {
        setEmail(decryptedEmail);
      } else {
        throw new Error("Failed to decrypt email");
      }
    } catch (error) {
      console.error("Decryption error:", error);
      toast.error("Invalid encrypted data.");
    }
  }, [encryptedData, secretKey]);

  const handleResend = () => {
    toast.success("Email resend successfully");
  };

  return (
    <section style={{ height: "100%" }}>
      <div className="container-fluid h-100">
          
            <div style={{top:"50%"}}>
              <h5>Password Recovery</h5>
              <div className="mt-4">
                <h6>Check your email</h6>
                <div>
                  <p className="mb-0" style={{ color: "#454C63" }}>
                    We have sent a password reset link to:
                  </p>
                  <p style={{ color: "#454C63", textDecoration: "underline" }}>
                    {email ? email : "Invalid email"}
                  </p>
                </div>
              </div>

              <div>
                {/* <p
                  onClick={handleResend}
                  style={{
                    textDecoration: "none",
                    color: "#00365C",
                    fontSize: "1em",
                    cursor: "pointer",
                  }}
                >
                  Resend e-mail
                </p> */}
                <p style={{ color: "#454C63" }}>
                  Back to&nbsp;
                  <span>
                    <a href="/" style={{ textDecoration: "none" }}>
                      login
                    </a>
                  </span>
                </p>
              </div>
            </div>
      </div>
      {/* Toast Container to show toasts */}
      <ToastContainer />
    </section>
  );
};

export default Password_Recovery;
