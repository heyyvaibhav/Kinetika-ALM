import { useState, useEffect } from "react"
import "./users.css"
import Loading from "../Templates/Loading"
import { getUserList } from "../../Service"
import { UserType } from "../DropdownOptions"
import SearchContainer from "../Search/Search"
import AddUser from "../AddUser/AddUser"

const Users = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("nor")
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState({ status: "", role: "" });

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

  useEffect(() => {
    handleSearchAndFilter()
  }, [users, searchTerm, sortOrder])

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

  const handleSearchAndFilter = () => {
    let filtered = [...users]
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (UserType.find(u => u.value === user.role)?.type || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    filtered.sort((a, b) =>
      sortOrder === "nor" ? null : sortOrder === "asc" ? a.full_name.localeCompare(b.full_name) : b.full_name.localeCompare(a.full_name)
    )
    setFilteredUsers(filtered)
  }

  const handleAddUser = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    fetchUsers()
  }

  const handleFilter = () => {
    setFilterModalOpen(true);
  }

  const handleReset = () => {
    setFilters({ status: "", role: "" });
  }
  const closeFilter = () => {
    setFilterModalOpen(false);
  }
  const applyFilters = async () => {
    setFilterModalOpen(false);
    setIsLoading(true);
    try {
        let queryParams = [];
        if (filters.status) queryParams.push(`status=${filters.status}`);
        if (filters.role) queryParams.push(`role=${filters.role}`);

        const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
        const response = await getUserList(`/users${queryString}`);

        const usersArray = Array.isArray(response.data) ? response.data : [response.data];
        setUsers(usersArray);
        setFilteredUsers(usersArray);
    } catch (err) {
        setError("Failed to apply filters. Please try again later.");
    }
    setIsLoading(false);
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>Users</h2>
        <button onClick={handleAddUser}>Add User</button>
      </div>

      <SearchContainer
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setSortOrder={setSortOrder}
        handleFilter={handleFilter}
      />

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
        {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No data found</td>
            </tr>
          ) : (
          filteredUsers.map((user) => (
            <tr key={user.user_id}>
              <td>
                <div className="name-cell">
                    <div 
                        className="avatar"
                        style={{ backgroundColor: getRandomColor(), color: "#fff", fontWeight: "bold", fontSize:"12px"}}
                    > 
                        {user.full_name && typeof user.full_name === "string"
                        ? user.full_name
                            .split(" ")
                            .map(word => word.charAt(0).toUpperCase())
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
          )))}
        </tbody>
      </table>

      {isLoading && <Loading show={isLoading} /> }

      {isModalOpen && <AddUser isOpen={isModalOpen} onClose={handleCloseModal} />}

      {filterModalOpen && (
        <div className='modal-overlay'>
          <div className="filter-modal">
            <div className='filter-header'>
              <h3 style={{margin: "0"}}>Filter Users</h3>
              <h3 onClick={closeFilter} style={{margin: "0"}}>X</h3>
            </div>
            <div className="modal-content">
              <div className='form-group'>
                <label>Status</label>
                <select 
                  required
                  className="form-control"  
                  value={filters.status} 
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className='form-group'>
                <label>Role</label>
                <select 
                  required
                  className="form-control"  
                  value={filters.role} 
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="">Select role</option>
                  {UserType.map(user => (
                    <option key={user.value} value={user.value}>
                      {user.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-footer">
              <div>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset</button>
              </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={closeFilter}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={applyFilters}>
                    Apply
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users