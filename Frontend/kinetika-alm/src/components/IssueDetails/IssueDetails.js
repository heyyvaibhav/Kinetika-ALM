import { useState } from "react"
import "./IssueDetails.css"

const IssueDetails = ({ onClose, issue }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true)
  const [status, setStatus] = useState(issue.status)
  const [priority, setPriority] = useState(issue.priority)
  const [activeTab, setActiveTab] = useState("description")
  const [description, setDescription] = useState(issue.description)
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState("")

  function formatDate(isoString) {
    const date = new Date(isoString)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const month = monthNames[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()

    return `${month} ${day}, ${year}`
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    // Here you would typically update the status in your backend
  }

  const handlePriorityChange = (e) => {
    setPriority(e.target.value)
    // Here you would typically update the priority in your backend
  }

  const handleDescriptionSave = () => {
    setIsEditing(false)
    // Here you would typically update the description in your backend
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    // Here you would typically add the comment to your backend
    setNewComment("")
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
            <p><b>Created On:</b> {formatDate(issue.created_at)}</p>
            <p style={{marginBottom:"20px"}}><b>Updated On:</b> {formatDate(issue.updated_at)}</p>
            <div className="tabs" style={{ justifyContent:"space-between", gap:"8px", background:"#F1F5F9", padding:"4px 8px", borderRadius:"10px",marginBottom:"20px"}}>
              <button
                className={`tab ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
                style={{ color:"#000", width:"30%", marginLeft:"2%", marginRight:"3%"}}
              >
                Description
              </button>
              <button
                className={`tab ${activeTab === "comments" ? "active" : ""}`}
                onClick={() => setActiveTab("comments")}
                style={{ color:"#000", width:"30%", marginRight:"3%"}}
              >
                Comments
              </button>
              <button
                className={`tab ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
                style={{ color:"#000", width:"30%"}}
              >
                History
              </button>
            </div>

            <div className="tab-content" style={{textAlign: "center"}}>
              {activeTab === "description" && (
                <div>
                  {isEditing ? (
                    <div>
                      <textarea className="description-text" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" />
                    </div>
                  ) : (
                    <div>
                      <p>{description}</p>
                      <button onClick={() => setIsEditing(true)}>Edit</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "comments" && (
                <div>
                  <form onSubmit={handleCommentSubmit}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows="3"
                    />
                    <button type="submit">Add Comment</button>
                  </form>
                  {/* Here you would map through and display existing comments */}
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
            <div className="details-card">
              <h3>Pinned fields</h3>
              <p>Click on the 📌 next to a field label to start pinning.</p>
            </div>

            <div className="details-collapsible">
              <button className="collapsible-header" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
                <i className={`fas fa-chevron-down ${isDetailsOpen ? "rotate" : ""}`}></i>
                <h3>Details</h3>
              </button>

              {isDetailsOpen && (
                <div className="collapsible-content">
                  <div className="detail-item">
                    <label>Assignee</label>
                    <select className="detail-button">
                      <option>Unassigned</option>
                    </select>
                  </div>

                  <div className="detail-item">
                    <label>Status</label>
                    <select className="detail-button" value={status} onChange={handleStatusChange}>
                      <option value="todo">To Do</option>
                      <option value="in progress">In Progress</option>
                      <option value="done">Done</option>
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
                      <div className="avatar">VA</div>
                      <span>Vaibhav Agarwal</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueDetails

