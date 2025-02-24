import { useState, useEffect } from "react"
import "./IssueDetails.css"
import { addComment, getComments, updateIssueStatus, getStatus, getUserList } from "../../Service"

const IssueDetails = ({ onClose, issue }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true)
  const [assignee, setAssignee] = useState(issue.assignee_id)
  const [status, setStatus] = useState(issue.status)
  const [priority, setPriority] = useState(issue.priority)
  const [activeTab, setActiveTab] = useState("comments")
  const [description, setDescription] = useState(issue.description)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState([])
  const [statusList, setStatusList] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  function formatDate(isoString) {
    const date = new Date(isoString)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const month = monthNames[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()

    return `${month} ${day}, ${year}`
  }

  const getColumns = async () => {
    try {
      const response = await getStatus(`/status`)
      const statuses = response.statuses; // Extract array

      setStatusList(statuses);
      if (!Array.isArray(statuses)) {
          throw new Error("Invalid response format");
      }

    } catch (error) {
      console.error("Error fetching statuses.", error)
    }
  }

  const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await getUserList("/users")
        const usersArray = Array.isArray(response.data) ? response.data : [response.data]
        setUsers(usersArray)
      } catch (error) {
        console.log(error)
        setIsLoading(false)
      } finally {
        setIsLoading(false)
      }
    }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
  }

  const handlePriorityChange = (e) => {
    setPriority(e.target.value)
  }

  const data = {
    "description": description,
    "assignee_id": assignee,
    // reporter,
    "status": status,
    "priority": priority,
  }

  const saveChanges = async () => {
    try {
      const response = await updateIssueStatus(`/issues/${issue.issue_id}`, data)

      onClose()
    } catch (error) {
      console.error("Error updating issue:", error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await getComments(`/issues/comments/${issue.issue_id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  
  useEffect(() => {
    fetchUsers();
    getColumns();
    if (activeTab === "comments") fetchComments();
  }, []); 

  const getRandomColor = () => {
    const colors = ["#FF5733", "#3357FF", "#FF33A1", "#FF8C33", "#8C33FF"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }
  
    try {
      const response = await addComment(`/issues/comments/${issue.issue_id}/comments`, {
        user_id: 1,
        comment_text: newComment
      });
  
      console.log("Comment submitted:", response.data);
      setNewComment("");
      fetchComments(); 
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="header-left">
            <span className="issue-tag">{issue.issue_key}</span>
            <h2 className="modal-title">{issue.summary}</h2>
          </div>
          <div className="header-right">
            <button className="icon-button" onClick={onClose}>
              <h3>X</h3>
            </button>
          </div>
        </div>

        <div className="modal-contentt">
          <div className="left-section">
            <div className="form-group">
              <h3 style={{marginBottom:"10px"}}>Description</h3>
              <textarea value={description} style={{width:"100%", height:"80px", fontFamily:"sans-serif"}}
                onChange={(e) => setDescription(e.target.value)} maxLength={500}>
              </textarea>

              <div style={{textAlign:"right"}}>
                <button onClick={saveChanges}>Save</button>
              </div>
            </div>

            <div className="tabs" style={{ width:"60%", justifyContent:"space-between", background:"#F1F5F9", padding:"4px 8px", borderRadius:"10px",marginBottom:"20px"}}>
              <button
                className={`tab ${activeTab === "comments" ? "active" : ""}`}
                onClick={() => setActiveTab("comments")}
                style={{ color:"#000", width:"48%", marginRight:"2%", marginLeft:"1%"}}
              >
                Comments
              </button>
              <button
                className={`tab ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
                style={{ color:"#000", width:"48%", marginRight:"1%"}}
              >
                History
              </button>
            </div>

            <div className="tab-content" style={{textAlign: "center"}}>
              {activeTab === "comments" && (
                <div>
                  <form onSubmit={handleCommentSubmit}>
                    <div className="form-group">
                      <textarea
                        resize="none"
                        style={{width:"100%", height:"80px", fontFamily:"sans-serif"}}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment"
                        rows="3"
                        maxLength={500}
                      />
                      <div style={{textAlign:"right"}}><button type="submit">Add Comment</button></div>
                    </div>
                  </form>

                  {/* Here you would map through and display existing comments */}
                  <div className="comments-section">
                    <h3 style={{marginBottom:"10px "}}>Comments</h3>
                    {comments.length > 0 ? (
                      comments.map((comment, index) => (
                        <div key={index} className="comment" style={{marginBottom:"10px"}}>
                          <div style={{display:"flex", justifyContent:"space-between"}}>
                            <div style={{display:"flex", justifyContent:"space-between", gap: "6px"}}>
                              <div className="avatar"> VA </div>
                              <strong>{comment.username || "Vaibhav"}</strong>
                            </div>

                            <small>{formatDate(comment.created_at)}</small>
                          </div>
                          
                          
                          <p>{comment.comment_text}</p>
                         
                        </div>
                      ))
                    ) : (
                      <p>No comments yet. Be the first to add one!</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  
                  {/* Here you would display more detailed history */}
                </div>
              )}
            </div>
          </div>

          <div className="details-section">
            <div className="details-collapsible">
              <button className="collapsible-header" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
                <i className={`fas fa-chevron-down ${isDetailsOpen ? "rotate" : ""}`}></i>
                <h3>Details</h3>
              </button>

              {isDetailsOpen && (
                <div className="collapsible-content">
                  <div className="detail-item">
                    <label>Assignee</label>
                    <select className="detail-button" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                    {users.map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.full_name}
                      </option>
                    ))}
                    </select>
                  </div>

                  <div className="detail-item">
                    <label>Status</label>
                    <select 
                      className="detail-button" 
                      value={status} 
                      onChange={handleStatusChange}
                    >
                      {statusList.map((option) => (
                        <option key={option.ID} value={option.ID}>
                          {option.Name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="detail-item">
                    <label>Priority</label>
                    <select className="detail-button" value={priority} onChange={handlePriorityChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="detail-item">
                    <label>Reporter</label>
                    <div className="reporter-info">
                      <div 
                        className="avatar"
                        style={{ backgroundColor: getRandomColor(), color: "#fff", fontWeight: "bold", height:"34px", width:"34px"}}
                      > 
                        {issue.reporter_name && typeof issue.reporter_name === "string"
                        ? issue.reporter_name
                            .split(" ")
                            .map(word => word.charAt(0).toUpperCase()) // Extracts and capitalizes initials
                            .join("")
                        : ""}
                      </div>
                      <span>{issue.reporter_name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
              <div style={{fontSize:"13px", color:"#bfbfbf"}}>
                <p>Created On: {formatDate(issue.created_at)}</p>
                <p>Updated On: {formatDate(issue.updated_at)}</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueDetails

