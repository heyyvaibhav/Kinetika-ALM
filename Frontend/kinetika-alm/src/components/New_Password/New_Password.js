import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../Login/Login.css";
import { ToastContainer, toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { resetPassword, validateToken } from "../../Service";
import Loading from "../Templates/Loading";

const New_Password = () => {
  const navigate = useNavigate();
  const { token } = useParams(); // Get token from URL
  const [type, setType] = useState("password");
  const [newPType, setNewPType] = useState("password");
  const [icon, setIcon] = useState(FiEyeOff);
  const [newPasswordIcon, setNewPasswordIcon] = useState(FiEyeOff);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  const [new_password, setNewPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");

  const [validations, setValidations] = useState({
    lengthValid: false,
    capitalValid: false,
    lowercaseValid: false,
    numberValid: false,
    passwordMatch: false,
  });

  const handleToggle = () => {
    setType(type === "password" ? "text" : "password");
    setIcon(type === "password" ? FiEye : FiEyeOff);
  };

  const handleToggleNew = () => {
    setNewPType(newPType === "password" ? "text" : "password");
    setNewPasswordIcon(newPType === "password" ? FiEye : FiEyeOff);
  };

  useEffect(() => {
    checkPasswordValidation();
  }, [new_password, confirm_password]);

  useEffect(() => {
    // console.log("token: ", token);
    validateTokenLink();
  }, []);

  const validateTokenLink = async () => {
    setLoading(true);
    try {
      
      const response = await validateToken(`/validateToken/${token}`);
      if (response) {
        // toast.success("Token is valid");
        setLoading(false);
      } else {
        setLoading(false);
        toast.error("Invalid or expired token");
        setTokenInvalid(true);
        // navigate("/"); // Redirect if token is invalid
      }
    } catch (error) {
      setLoading(false);
      console.error("Error validating token:", error);
      toast.error("An error occurred while validating the token.");
      navigate("/"); // Redirect in case of error
    }
  };

  const checkPasswordValidation = () => {
    const lengthValid = new_password.length >= 8;
    const capitalValid = /[A-Z]/.test(new_password);
    const lowercaseValid = /[a-z]/.test(new_password);
    const numberValid = /[0-9]/.test(new_password);
    const passwordMatch = new_password === confirm_password;

    setValidations({
      lengthValid,
      capitalValid,
      lowercaseValid,
      numberValid,
      passwordMatch,
    });
  };

  const getValidationClass = (isValid, isEmpty) => {
    if (isEmpty) {
      return "gray-text";
    }
    return isValid ? "green-text" : "red-text";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      validations.capitalValid &&
      validations.lengthValid &&
      validations.lowercaseValid &&
      validations.numberValid &&
      validations.passwordMatch
    ) {
      try {
        const resetData = {
          newPassword: new_password,
          token: token,
        };
        setLoading(true);

        const response = await resetPassword("/resetPassword", resetData);

        if (response) {
          setLoading(false);
          toast.success("Password Updated Successfully!!!");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      } catch (error) {
        setLoading(false);
        console.error("Error updating password:", error);
        toast.error("An error occurred while updating the password.");
      }
    } else {
      toast.error("Password is not valid");
    }
  };

  return (
    <>
      {!tokenInvalid && (
        <section style={{ height: "100%" }}>
          <div className="container-fluid h-100">

              <div className="col-6-5 d-flex flex-column justify-content-center align-items-center">
                <form style={{background:"white", borderRadius:"10px", padding:"20px",}}
                  className="d-flex flex-column mb-0 form-width pt-5"
                  onSubmit={handleSubmit}
                >
                  <img
                    src="/namelogo.png"
                    className="img-fluid"
                    style={{ width: "15em", margin: "0 auto 10px",borderRadius:"8px" }}
                    alt="Placeholder"
                  />
                  <p className="bolder h5 mt-2">Welcome back!</p>
                  <p className="sub-para">
                    Set a new password for your account.
                  </p>
                  <hr className="m-1" />
                  <label
                    htmlFor="new_password"
                    className="text-start mb-2 mt-3"
                  >
                    New Password
                  </label>
                  <div className="password_input mb-2">
                    <input
                      type={newPType}
                      placeholder="Enter password"
                      className="form-control mb-2"
                      id="new_password"
                      value={new_password}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={handleToggleNew}
                      style={{ cursor: "pointer", top:"45%" }}
                    >
                      {newPType === "password" ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </span>
                  </div>

                  <label htmlFor="confirm_password" className="text-start mb-2">
                    Confirm New Password
                  </label>
                  <div className="password_input">
                    <input
                      type={type}
                      placeholder="Enter password"
                      id="confirm_password"
                      className="form-control mb-2"
                      value={confirm_password}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <span onClick={handleToggle} style={{ cursor: "pointer", top:"45%"  }}>
                      {type === "password" ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </span>
                  </div>

                  <div className="text-start">
                    <p style={{ fontSize: "0.9em" }}>
                      Your password must contain:
                    </p>
                    <p
                      className={getValidationClass(
                        validations.capitalValid,
                        !new_password
                      )}
                    >
                      <span>&#10003;</span> At least one capital letter
                    </p>
                    <p
                      className={getValidationClass(
                        validations.lowercaseValid,
                        !new_password
                      )}
                    >
                      <span>&#10003;</span> At least one lowercase letter
                    </p>
                    <p
                      className={getValidationClass(
                        validations.numberValid,
                        !new_password
                      )}
                    >
                      <span>&#10003;</span> At least one number
                    </p>
                    <p
                      className={getValidationClass(
                        validations.lengthValid,
                        !new_password
                      )}
                    >
                      <span>&#10003;</span> A minimum character length of 8
                      characters
                    </p>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: "#1d3557" }}
                    className="btn btn-primary mt-4 mb-2"
                  >
                    Set new password
                  </button>

                  <p className="text-center mt-4 gray-text">
                    Back to
                    <strong>
                      <a href="/login"> &nbsp;Login</a>
                    </strong>
                  </p>
                </form>
              </div>

          </div>
          <ToastContainer />
        </section>
      )}

      {tokenInvalid && (
        <h5
          className="d-flex flex-direction-row justify-content-center align-items-center text-danger m-0"
          style={{ width: "100%", height: "100vh" }}
        >
          Token Expired or Invalid
        </h5>
      )}

      {/* <Loading show={loading} /> */}
    </>
  );
};

export default New_Password;
