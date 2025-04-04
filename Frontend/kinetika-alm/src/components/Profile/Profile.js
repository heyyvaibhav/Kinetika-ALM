import React, {useState, useEffect, useRef} from "react";
import HeaderNav from "../Templates/HeaderNav";
import { getUserDetails, fetchProfile, changePassword, updateProfile, uploadPicture, deletePicture } from "../../Service";
import Loading from "../Templates/Loading";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
// import { UserType } from "../DropdownOptions";
import { Environment, NewRelicConfig } from "../../environment";
import "./Profile.css";

const Profile = () => {
    const [profile, setProfile] = useState({});
    const [activeTab, setActiveTab] = useState("profile")
    const [animateProfile, setAnimateProfile] = useState(false)
    const [showInputs, setShowInputs] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const userTokenData = getUserDetails();
    const [loading, setLoading] = useState(false);
    const { month, year } = getMonthAndYear(profile.created_at);
    const widgetsRef = useRef();
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
    };

    const getInitials = (fullName) => {
      return fullName && typeof fullName === "string"
        ? fullName
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase())
            .join("")
        : "";
    };

    useEffect(() => {
      fetchProfileByID();
      setAnimateProfile(true)
    }, []);

    const initializeCloudinaryWidget = async () => {
      if (!window.cloudinary) {
        console.error("Cloudinary library is not loaded.");
        return;
      }
  
      if (!widgetsRef.current) {
        // Initialize the Cloudinary widget only once
        widgetsRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName: NewRelicConfig.cloudName,
            uploadPreset: NewRelicConfig.uploadPreset,
            multiple: false, // Single upload only
            clientAllowedFormats: ["jpeg", "jpg", "png"], // Acceptable formats
            maxFileSize: 5 * 1024 * 1024, // 5 MB
          },
          (error, result) => {
            if (!error && result && result.event === "success") {
              const newImage = result.info.secure_url; // Extract the secure URL of the uploaded image
              setFormData((prevState) => ({
                ...prevState, // Spread the previous state to retain other properties
                ProfileImage: newImage, // Set the `profile_image` property as a string
              }));
              widgetsRef.current.close(); // Close the widget after successful upload
              toast.success("Photo uploaded. Click Save!!", {
                zIndex: 5000, // Correct syntax for custom zIndex
              });
              setLoading(false);
            } else if (error) {
              if (
                error?.status?.includes("exceeds maximum allowed (5 MB)") &&
                error?.statusText?.includes("File size")
              ) {
                toast.error("File size exceeds 5 MB. Please upload a smaller file.");
                widgetsRef.current.close();
              } else if (
                error?.status === "File format not allowed" &&
                error?.statusText?.includes("File format not allowed")
              ) {
                toast.error("File format not allowed");
                widgetsRef.current.close();
              }
              setLoading(false);
            }
            else if (error) {
              console.error("Upload Error:", error);
              setLoading(false);
            }
          }
        );
      }
      setLoading(true);
      widgetsRef.current.open(); // Open the widget
    };

    const handleUploadPicture = async () => {
      setLoading(true);
      try{
        const response = await uploadPicture(`/picture/${userTokenData.id}`, {
          ProfileImage: formData.ProfileImage
        });
        toast.success(response.message);
        toggleDropdown();
        fetchProfileByID();
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    const handleRemove = async () => {
      setLoading(true);
      try{
        const response = await deletePicture(`/delete/${userTokenData.id}`);
        toast.success(response.message);
        toggleDropdown();
        fetchProfileByID();
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    const fetchProfileByID = async () => {
      setLoading(true);
      try {
        const response = await fetchProfile(`/getProfile/${userTokenData.id}`);
        setProfile(response);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target

      const cleanedValue = name === "MobileNumber"
      ? value.replace(/\D/g, "")
      : value;

      setFormData({
        ...formData,
        [name]: cleanedValue,
      })
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true);
      try {
        await updateProfile(`/updateProfile/${userTokenData.id}`, {
          MobileNumber: formData.MobileNumber,
          Address: formData.Address,
          DOB: formData.DOB,
          State: formData.State,
          City: formData.City,
          BIO: formData.BIO,
        });
        toast.success("Profile updated successfully!");
        setFormData({});
        fetchProfileByID();
      } catch (error) {
        console.error("Failed to update profile", error);
      }
      setIsEditing(false)
      setLoading(false)
    }
  
    // Toggle edit mode
    const toggleEditMode = () => {
      if (!isEditing) {
        setFormData({ ...profile });
      }
      setIsEditing(!isEditing);
    }

    const handleChangePassword = async () => {
      if (newPassword !== confirmPassword) {
        toast.warn("New passwords do not match");
        return;
      }
      if (newPassword.length < 8) {
        toast.warn("Password must be at least 8 characters");
        return;
      }
      try {
        await changePassword(`/changePassword/${userTokenData.id}`, {
          currentPassword: oldPassword,
          newPassword: newPassword,
        });
        toast.success("Password changed successfully!");
        setShowInputs(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        console.error("Failed to change password", error);
      }
    };

    const togglePasswordVisibility = (field) => {
      // eslint-disable-next-line default-case
      switch (field) {
        case "old":
          setShowOldPassword(!showOldPassword);
          break;
        case "new":
          setShowNewPassword(!showNewPassword);
          break;
        case "confirm":
          setShowConfirmPassword(!showConfirmPassword);
          break;
      }
    };

    function getMonthAndYear(dateString) {
      const date = new Date(dateString);
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();
      return { month, year };
    }

    console.log(profile.ProfileImage); 

  return (

    <div className="profile">
      <HeaderNav
        name="Profile"
        // button_name="Edit Profile"
        // buttonClick={handleEditProfile}
      />
    
      {/* Main content */}
      <div className="main-contentt">
        {/* Animated background elements */}
        <div className="animated-background">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="floating-snowflake"
              style={{
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 30 + 10}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `fallDown ${Math.random() * 10 + 15}s linear infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="content-wrapper">
          <div className="profile-grid">
            {/* Profile Summary Card */}
            <div className={`card profile-summary ${animateProfile ? "animate-in" : ""}`}>
              <div className="card-content center-content">
                <div className="avatar-container">
                  <div className="user-avatar" onClick={toggleDropdown}>
                    {profile.ProfileImage ? (
                      <img src={profile.ProfileImage} alt={getInitials(profile.full_name)} className="avatar-image" />
                    ) : (
                      <div className="avatar-initials">{getInitials(profile.full_name)}</div>
                    )}
                  </div>

                  {showDropdown && (
                    <div className="dropdown-menu">
                      {!profile.ProfileImage && 
                        <button onClick={() => initializeCloudinaryWidget()}>
                          {loading ? "Uploading.." : "Upload Picture"}
                        </button>}
                      
                      {profile.ProfileImage && <button onClick={handleRemove}>Remove Picture</button>}

                      {!profile.ProfileImage && <button onClick={handleUploadPicture}>Save</button>}
                    </div>
                  )}
                  {profile.Status === "Active" && <div className="status-indicator"></div>}
                </div>

                <h2 className="profile-name">{profile.full_name}</h2>
                <p className="profile-email">{profile.email}</p>

                <div className="profile-stats">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <p className="stat-label">Member Since</p>
                      <p className="stat-value"> {month} {year}</p>
                    </div>

                    <div className="stat-item">
                      <p className="stat-label">Status</p>
                      <p className="stat-value status-active">{profile.Status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Profile Content */}
            <div className={`card profile-details ${animateProfile ? "animate-in delay-1" : ""}`}>
              <div className="tab-header">
                <button
                  className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  Personal Information
                </button>
                <button
                  className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  Account Settings
                </button>
              </div>

              <div className="card-content">
                {activeTab === "profile" ? (
                  <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                      {/* Read-only fields */}
                      <ProfileField label="Full Name" value={profile.full_name} />
                      <ProfileField label="Email Address" value={profile.email} />

                      {/* Editable fields */}
                      {isEditing ? (
                        <>
                          <EditableField
                            label="Phone Number"
                            name="MobileNumber"
                            value={formData.MobileNumber}
                            onChange={handleInputChange}
                            maxlength={10}
                          />
                          <EditableField
                            label="Date of Birth"
                            name="DOB"
                            value={formData.DOB}
                            onChange={handleInputChange}
                          />
                          <EditableField
                            label="Address"
                            name="Address"
                            value={formData.Address}
                            onChange={handleInputChange}
                            className="full-width"
                          />
                          <EditableField
                            label="City"
                            name="City"
                            value={formData.City}
                            onChange={handleInputChange}
                            maxlength={50}
                          />
                          <EditableField
                            label="State"
                            name="State"
                            value={formData.State}
                            onChange={handleInputChange}
                            maxlength={50}
                          />
                          <EditableField
                            label="Bio"
                            name="BIO"
                            value={formData.BIO}
                            onChange={handleInputChange}
                            className="full-width"
                            isTextarea={true}
                          />
                        </>
                      ) : (
                        <>
                          <ProfileField label="Phone Number" value={profile.MobileNumber} />
                          <ProfileField label="Date of Birth" value={profile.DOB} />
                          <ProfileField label="Address" value={profile.Address} className="full-width" />
                          <ProfileField label="City" value={profile.City} />
                          <ProfileField label="State" value={profile.State} />
                          <ProfileField label="Bio" value={profile.BIO} className="full-width" style={{height:"80px"}} />
                        </>
                      )}
                    </div>

                    <div className="form-actions">
                      {isEditing ? (
                        <>
                          <button type="button" className="btn btn-outline" onClick={toggleEditMode}>
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary">
                            Save Changes
                          </button>
                        </>
                      ) : (
                        <button type="button" className="btn btn-primary" onClick={toggleEditMode}>
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="settings-content">
                    <div className="settings-section">
                      <h3 className="section-title">Security Settings</h3>

                      <div className="settings-cards">
                        <div className="settings-card">
                          <div className="settings-card-content">
                            <div>
                              <h4 className="settings-card-title">Password</h4>
                            </div>
                            <button 
                              className="btn btn-primary"  
                              onClick={() => setShowInputs(!showInputs)}
                            >
                              {showInputs ? "X" : "Change"}
                            </button>
                          </div>

                          {showInputs && (
                            <div className="password-inputs"  style={{ marginTop: "20px" }}>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleChangePassword();
                                }}
                              >
                                <div className="form-group">
                                  <label style={{marginLeft:"40px"}}>Current Password</label>
                                  <div className="password-input-wrapper">
                                    <input
                                      type={showOldPassword ? "text" : "password"}
                                      id="oldPassword"
                                      value={oldPassword}
                                      onChange={(e) => setOldPassword(e.target.value)}
                                      placeholder="Enter old password"
                                      className="form-control"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => togglePasswordVisibility("old")}
                                      className="toggle-password"
                                      // style={{background:"transparent", color:"#a6a4b2", position:"absolute", right:"10px", top:"10%"}}
                                    >
                                      {showOldPassword ? (
                                        <FiEye size={20} />
                                      ) : (
                                        <FiEyeOff size={20} />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <div className="form-group">
                                  <label style={{marginLeft:"40px"}}>New Password</label>
                                  <div className="password-input-wrapper">
                                    <input
                                      type={showNewPassword ? "text" : "password"}
                                      id="newPassword"
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      placeholder="Enter new password"
                                      className="form-control"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => togglePasswordVisibility("new")}
                                      className="toggle-password"
                                    >
                                      {showNewPassword ? (
                                        <FiEye size={20} />
                                      ) : (
                                        <FiEyeOff size={20} />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <div className="form-group">
                                  <label style={{marginLeft:"40px"}}>Confirm Password</label>
                                  <div className="password-input-wrapper">
                                    <input
                                      type={showConfirmPassword ? "text" : "password"}
                                      id="confirmPassword"
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      placeholder="Confirm new password"
                                      className="form-control"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => togglePasswordVisibility("confirm")}
                                      className="toggle-password"
                                    >
                                      {showConfirmPassword ? (
                                        <FiEye size={20} />
                                      ) : (
                                        <FiEyeOff size={20} />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <div style={{textAlign:"right", marginRight:"40px"}}><button type="submit">Update</button></div>
                              </form>
                            </div>
                          )}
                        </div>
                      </div> 
                    </div>

                    <div className="danger-zone">
                      <h3 className="section-title">Danger Zone</h3>
                      <button className="btn btn-danger">Delete Account</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Card */}
            {/* <div className={`card activity-card ${animateProfile ? "animate-in delay-2" : ""}`}>
              <div className="card-content">
                <h3 className="section-title">Recent Activity</h3>
                <div className="activity-list">
                  {[
                    { action: "Profile updated", time: "2 hours ago" },
                    { action: "Password changed", time: "3 days ago" },
                    { action: "Logged in from new device", time: "1 week ago" },
                  ].map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        <Bell size={18} className="icon" />
                      </div>
                      <div>
                        <p className="activity-title">{activity.action}</p>
                        <p className="activity-time">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {loading && <Loading show={loading} />}
    </div>
  )
}

export default Profile;

// Regular profile field (non-editable)
function ProfileField({ label, value, className = "" }) {
  return (
    <div className={`form-field ${className}`}>
      <label className="field-label">{label}</label>
      <div className="field-value">
        <p>{value}</p>
      </div>
    </div>
  )
}

// Editable field component
function EditableField({ label, name, value, onChange, className = "", isTextarea = false, maxlength }) {
  return (
    <div className={`form-field ${className}`}>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      {isTextarea ? (
        <textarea id={name} name={name} value={value} onChange={onChange} placeholder="Enter a bio" className="form-control textarea" rows="4" />
      ) : (name === "DOB" ? (
          <input type="date" id={name} name={name} value={value} onChange={onChange} placeholder={"Enter " + label} className="form-control" />
        ) : name === "MobileNumber" ? (
          <input type="tel" id={name} name={name} value={value} onChange={onChange} maxLength={maxlength} placeholder={"Enter " + label} className="form-control" />
        ) : (
          <input type="text" id={name} name={name} value={value} onChange={onChange} maxLength={maxlength} placeholder={"Enter " + label} className="form-control" />
      ))}
    </div>
  )
}

