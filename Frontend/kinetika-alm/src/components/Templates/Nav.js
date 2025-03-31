import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserList, getUserDetails } from "../../Service";
import { UserType } from "../DropdownOptions";
import './Templates.css';

const Nav = () => {
  const [userDetail, setUserDetail] = useState();
  const [profileInfo, setProfileInfo] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const userTokenData = getUserDetails();
        if (userTokenData) {
          setUserDetail(userTokenData);
          const response = await getUserList(
            `/users/${userTokenData.id}`
          );
          setProfileInfo(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchDetails();
  }, []);

  const profileSection = () => {
    navigate("/main/profile");
  };

  // const handleLogout = () => {
  //   localStorage.clear();
  //   navigate("/");
  // };

  // const handleNotificationClick = () => {
  //   navigate("/main/notification");
  // };

  return (
    <div>
      <header>
        <div className="user-menu">
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{userDetail?.name}</span>
              <span className="user-role">
                {userDetail?.type && UserType[Number(userDetail.type) - 1]
                  ? UserType[Number(userDetail.type) - 1].type
                  : "Unknown Role"}
              </span>
            </div>

            <div 
                className="avatar"
                style={{ backgroundColor: '#518ca6', color: "#fff", fontWeight: "bold", height:"34px", width:"34px", fontSize:"14px", cursor:"pointer"}}
                onClick={profileSection}
            > 
            {profileInfo[0]?.full_name && typeof profileInfo[0]?.full_name === "string"
            ? profileInfo[0]?.full_name
                .split(" ")
                .map(word => word.charAt(0).toUpperCase())
                .join("")
            : ""}  
            </div>          
          </div>
        </div>
      </header>
    </div>
  );
};

export default Nav;
