import { useState } from "react"
import "./AddUser.css"
import { UserType } from "../DropdownOptions"
import { addUser } from "../../Service"

const AddUser = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      username,
      full_name: fullName,
      password_hash: ".",
      email,
      role,
    };

    try {
      const response = await addUser("/users", userData);
      console.log("User created successfully:", response.data);

      setUsername("");
      setFullName("");
      setEmail("");
      setRole("");

    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to add user. Please try again.");
    }
    onClose();
  };

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Add User</h2>
          <div className="modal-actions">
            <button className="icon-button" onClick={onClose}>
              <h1 className="close-icon">X</h1>
            </button>
          </div>
        </div>

        
        <form onSubmit={handleSubmit} style={{padding:"20px"}}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" style={{width:"100%"}} value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter a username" />
          </div>
          <div className="form-group">
            <label htmlFor="fullName">Full Name:</label>
            <input type="text" id="fullName" style={{width:"100%"}} value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Enter full name"/>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" style={{width:"100%"}} value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter email"/>
          </div>
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{width:"100%"}}>
                <option disabled value="">Select a Role</option>
                {UserType.map((user) => (
                    <option key={user.value} value={user.value}>
                    {user.type}
                    </option>
                ))}
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="modal-footer">
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                Save
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default AddUser

