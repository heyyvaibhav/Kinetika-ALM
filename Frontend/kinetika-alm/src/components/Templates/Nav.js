import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
// import { getProfileInfo, getUserDetails } from "../../Service";
import { UserType } from "../DropdownOptions";

const Nav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDetail, setUserDetail] = useState();
  const [profileInfo, setProfileInfo] = useState();

  const navigate = useNavigate();

  // useEffect(() => {
  //   // Fetch user details and profile info
  //   const fetchDetails = async () => {
  //     try {
  //       const userTokenData = getUserDetails();
  //       if (userTokenData) {
  //         setUserDetail(userTokenData);
  //         const response = await getProfileInfo(
  //           `/getProfile/${userTokenData.id}`
  //         );
  //         setProfileInfo(response);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };
  //   
  //   fetchDetails();
  // }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleNotificationClick = () => {
    navigate("/main/notification");
  };

  return (
    <div style={{ backgroundColor: "#F7F8F9" }}>
      <header>
        <div className="user-menu">
          <button
            className="profile-refresh-btn"
            onClick={handleNotificationClick}
            style={{margin:'0px'}}
          >
            <img
              src="/notification-icon.svg"
              alt="Refresh"
              className="refresh-icon"
              style={{margin:'0px'}}
            />
          </button>
          <div className="user-info">
            <img
              src={profileInfo?.ProfileImage || "/user_profile.png"}
              alt="User Avatar"
              className="user-avatar"
            />
            <div className="user-details">
              <span className="user-name">{userDetail?.name}</span>
              <span className="user-role">
                {userDetail?.type && UserType[Number(userDetail.type) - 1]
                  ? UserType[Number(userDetail.type) - 1].type
                  : "Unknown Role"}
              </span>
            </div>
            <div className="dropdown-container" style={{margin:'0px'}}>
              <button className="user-role-button" onClick={toggleDropdown}>
                <img src="/chevron-down.svg" alt="" className="dropdown-icon" />
              </button>
              {isDropdownOpen && (
                <div className="user-dropdown">
                  <NavLink to={"/main/profile"} className="dropdown-item">
                    Profile
                  </NavLink>
                  <NavLink
                    to={"/"}
                    onClick={handleLogout}
                    className="dropdown-item"
                  >
                    Logout
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Nav;
