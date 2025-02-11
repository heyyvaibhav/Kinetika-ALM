import { useState, useEffect } from "react"
import "./users.css"
import Loading from "../Templates/Loading"
import { getUserList } from "../../Service"
import { UserType } from "../DropdownOptions"
import SearchContainer from "../Search/Search"
import AddUser from "../AddUser/AddUser"

const Users = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  function formatDate(isoString) {
    const date = new Date(isoString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  }

  const getRandomColor = () => {
    const colors = ["#FF5733", "#3357FF", "#FF33A1", "#FF8C33", "#8C33FF"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const fetchUsers = async () => {
    try {
      const response = await getUserList("/users")
      const usersArray = Array.isArray(response.data) ? response.data : [response.data]
      setUsers(usersArray)
      setIsLoading(false)
    } catch (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  const handleAddUser = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    fetchUsers();
  }

  return (
    <div className="users-container">
       <div className="users-header">
        <h2>Users</h2>
        <button onClick={handleAddUser}>Add User</button>
      </div>

      <SearchContainer />
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Failed Login Attempts</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>
                <div className="name-cell">
                    <div 
                        className="avatar"
                        style={{ backgroundColor: getRandomColor(), color: "#fff", fontWeight: "bold" }}
                    > 
                        {user.full_name && typeof user.full_name === "string"
                        ? user.full_name
                            .split(" ")
                            .map(word => word.charAt(0).toUpperCase()) // Extracts and capitalizes initials
                            .join("")
                        : ""}
                    </div>
                    <div style={{display:"column"}}>
                        <span>{user.full_name}</span>
                        <p style={{fontSize:"10px", color:"gray"}}>
                            {UserType.find(u => u.value == user.role)?.type}
                        </p>
                    </div>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                  <span
                    style={{ 
                      fontSize: "12px",
                      display: "inline-block",  
                      padding: "4px",      
                      minWidth: "80px",
                      textAlign: "center",      
                      fontWeight: "bold",
                      color: user.Status === "Active" ? "#1E7E34" : 
                        user.Status === "Disabled" ? "#DC3545" : "black" ,
                      backgroundColor: user.Status === "Active" ? "#E6F4EA" : 
                        user.Status === "Disabled" ? "#FDE7E9" : "#ddd" ,
                      borderRadius:"10px", 
                    }}
                  >
                    {user.Status}
                  </span>
              </td>
              <td>{user.FailedLoginAttempts}</td>
              <td>{formatDate(user.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isLoading && <Loading show={isLoading} /> }

      {isModalOpen && <AddUser isOpen={isModalOpen} onClose={handleCloseModal} />}
    </div>

   
  )
}

export default Users

