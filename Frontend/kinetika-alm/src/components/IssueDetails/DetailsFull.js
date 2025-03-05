import { useState, useEffect, useCallback } from "react"
import './DetailsFull.css';
import { addComment, getComments, updateIssueStatus, getStatus, getUserList, getHistory } from "../../Service"
import { toast } from "react-toastify"
import RichTextEditor from "../Templates/TextEditor.js"
import { useLocation, useParams } from "react-router-dom";
import Loading from "../Templates/Loading.js"

const DetailsFull = () => {
  const location = useLocation();
  const issue = location.state?.issue;
  const [isDetailsOpen, setIsDetailsOpen] = useState(true)
  const [assignee, setAssignee] = useState(issue.assignee_id)
  const [status, setStatus] = useState(issue.status)
  const [priority, setPriority] = useState(issue.priority)
  const [activeTab, setActiveTab] = useState("comments")
  const [description, setDescription] = useState(issue.description)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState([])
  const [history, setHistory] = useState([])
  const [statusList, setStatusList] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const userid = localStorage.getItem("userId");

  function formatDate(isoString) {
    const date = new Date(isoString)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const month = monthNames[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()

    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const amPm = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12 // Convert 0 to 12 for AM

    return `${month} ${day}, ${year} - ${formattedHours}:${minutes} ${amPm}`
  }

  const getColumns = useCallback(async () => {
    try {
      const response = await getStatus(`/status`)
      const statuses = response.statuses // Extract array
      setStatusList(statuses)
    } catch (error) {
      console.error("Error fetching statuses.", error)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getUserList("/users")
      const usersArray = Array.isArray(response.data) ? response.data : [response.data]
      setUsers(usersArray)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleStatusChange = (value) => {
    setStatus(value)
  }

  const handlePriorityChange = (value) => {
    setPriority(value)
  }

  const handleAssigneeChange = (value) => {
    setAssignee(value)
  }

  const data = {
    description: description,
    assignee_id: assignee,
    status: status,
    priority: priority,
    userid: userid,
  }

  const saveChanges = async () => {
    try {
      await updateIssueStatus(`/issues/${issue.issue_id}`, data)
      toast({
        title: "Changes saved",
        description: "Issue has been updated successfully",
      })
      fetchHistory();
    } catch (error) {
      console.error("Error updating issue:", error)
      toast({
        title: "Error",
        description: "Failed to update issue",
        variant: "destructive",
      })
    }
  }

  const fetchComments = async () => {
    try {
      const response = await getComments(`/issues/comments/${issue.issue_id}/comments`)
      setComments(response.data)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
    getColumns()
  }, [fetchUsers, getColumns])

  useEffect(() => {
    if (activeTab === "comments") fetchComments()
    if (activeTab === "history") fetchHistory()
  }, [activeTab])

  const getRandomColor = () => {
    const colors = [
      "#FF5733",
      "#3357FF",
      "#FF33A1",
      "#FF8C33",
      "#8C33FF",
      "#33FF57",
      "#FFC300",
      "#DAF7A6",
      "#C70039",
      "#900C3F",
      "#581845",
      "#FF6F61",
      "#6B5B95",
      "#88B04B",
      "#F7CAC9",
      "#92A8D1",
      "#955251",
      "#B565A7",
      "#009B77",
      "#DD4132",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || newComment === "<br>") {
      toast({
        title: "Warning",
        description: "Comments cannot be empty",
        variant: "warning",
      })
      return
    }

    try {
      await addComment(`/issues/comments/${issue.issue_id}/comments`, {
        user_id: userid,
        comment_text: newComment,
      })

      setNewComment("")
      fetchComments()
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      })
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await getHistory(`/issues/history/issuehistory/${issue.issue_id}`)
      setHistory(response)
    } catch (error) {
      console.error("Failed to fetch history:", error)
    }
  }

  function formatTime(isoString) {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date

    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSeconds < 60) return `${diffSeconds} seconds ago`
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffMonths < 12) return `${diffMonths} months ago`

    return `${diffYears} years ago`
  }

  return (
    <div className="detail-background">
      <div className="detail-header">
        <h2>Issue Details - {issue.issue_key}</h2>
        <button onClick={saveChanges}>Save</button>
      </div>
      <div style={{display:"flex"}}>
        <div className="detail-body" style={{width:"65%",  padding:"0 20px"}}>
          <div className="space-y-6">
            <div className="form-group">
              <h3 style={{marginBottom:"10px"}}>Description</h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                maxLength={500}
                placeholder="Enter the description"
                style={{ height:"100px"}}
              />
            </div>

            <div className="tabs" style={{ width:"80%", justifyContent:"space-between", background:"#F1F5F9", padding:"4px 8px", borderRadius:"10px",marginBottom:"20px"}}>
              <button
                className={`tab ${activeTab === "comments" ? "active" : ""}`}
                onClick={() => setActiveTab("comments")}
                style={{ color:"#000", width:"33%", marginLeft:"0.5%"}}
              >
                Comments
              </button>
              <button
                className={`tab ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
                style={{ color:"#000", width:"33%",}}
              >
                History
              </button>
              <button
                className={`tab ${activeTab === "attachments" ? "active" : ""}`}
                onClick={() => setActiveTab("attachments")}
                style={{ color:"#000", width:"33%", }}
              >
                Attachments
              </button>
            </div>

            <div className="tab-content" style={{textAlign: "center"}}>
              {activeTab === "comments" && (
                <div>
                  <form>
                    <div className="form-group">
                      {/* <textarea
                        resize="none"
                        style={{ height:"80px", fontFamily:"sans-serif"}}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment"
                        rows="3"
                        maxLength={500}
                        className="form-control"
                      /> */}

                      <RichTextEditor
                        style={{ height: "100px", fontFamily: "sans-serif", padding: "8px 16px" , textAlign:"left"}}
                        value={newComment}
                        onChange={(text) => setNewComment(text)}
                        className="form-control"
                      />
                      <div style={{textAlign:"right", paddingTop:"10px"}}><button onClick={handleCommentSubmit}>Add Comment</button></div>
                    </div>
                  </form>

                  <div className="comments-section">
                    <div style={{height:"40px", position:"sticky", top:"0", zIndex:"10", width:"100%", background:"white", alignItems:"center"}}>
                      <h3 style={{ marginBottom:"10px" }}>Comments</h3>
                    </div>
                    {comments.length > 0 ? (
                      comments.map((comment, index) => (
                        <div key={index} className="comment">
                          <div 
                            className="avatar"
                            style={{ backgroundColor: getRandomColor(), color: "#fff", fontWeight: "bold", height:"34px", width:"37.62px", fontSize:"14px"}}
                          > 
                            {comment.username && typeof comment.username === "string"
                            ? comment.username
                                .split(" ")
                                .map(word => word.charAt(0).toUpperCase())
                                .join("")
                            : ""}
                          </div>
                          <div style={{width:"100%"}}>
                            <div style={{display:"flex", justifyContent:"space-between", gap:"4px",}}>
                              <strong>{comment.username || "Undefined"}</strong>
                              <small>{formatTime(comment.created_at)}</small>
                            </div>
                            <div><p>{comment.comment_text}</p></div>
                          </div>
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
                  <div className="history-section">
                    <div style={{height:"40px", position:"sticky", top:"0", zIndex:"10", width:"100%", background:"white", alignItems:"center"}}>
                      <h3 style={{ marginBottom:"10px" }}>History</h3>
                    </div>

                    {history.length > 0 ? (
                      history.map((entry, index) => (
                        <div key={index} className="history">
                          <div 
                            className="avatar"
                            style={{ backgroundColor: getRandomColor(), color: "#fff", fontWeight: "bold", height:"34px", width:"37.62px", fontSize:"14px"}}
                          > 
                            {entry.username && typeof entry.username === "string"
                            ? entry.username
                                .split(" ")
                                .map(word => word.charAt(0).toUpperCase())
                                .join("")
                            : ""}
                          </div>
                          <div style={{width:"100%",  alignItems:"center"}}>
                            <div style={{display:"flex", justifyContent:"space-between", gap:"4px",}}>
                              <strong>{entry.username || "Undefined"}</strong>
                              <small>{formatTime(entry.updated_at)}</small>
                            </div>
                            <div>
                              {
                              (entry.field_changed === "Comment Added") ? (
                                <span> Added a comment.</span>
                              ) : (entry.field_changed === "Issue Created") ? (
                                <span> Created an issue.</span>
                              ) : (entry.field_changed === "assignee") ? (
                                <span> Assigned the issue to <span className="b">{entry.new_value}</span>.</span>
                              ) : (entry.field_changed === "description") ? (
                                <span> Updated the issue description.</span>
                              ) : (entry.field_changed === "priority") ? (
                                <span> Updated the issue priority from <span className="b">{entry.old_value}</span> to <span className="b">{entry.new_value}</span>.</span>
                              ) : (entry.field_changed === "status") ? (
                                <span> Updated the issue status from <span className="b">{statusList.find(s => s.ID == entry.old_value)?.Name || 'Unknown Status'}</span> to <span className="b">{statusList.find(s => s.ID == entry.new_value)?.Name || 'Unknown Status'}</span>.</span>
                              ) : (
                                <span> Updated the issue <span className="b">{entry.field_changed}</span> from <span className="b">{entry.old_value}</span> to <span className="b">{entry.new_value}</span></span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No Issue history present.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div style={{width:"35%", padding:"0 20px"}}>
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
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="detail-item">
                    <label>Reporter</label>
                    <div className="reporter-info">
                      <div 
                        className="avatar"
                        style={{ backgroundColor: getRandomColor(), color: "#fff", fontWeight: "bold", height:"34px", width:"34px", fontSize:"14px"}}
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
              <div style={{fontSize:"13px", color:"#bfbfbf", padding:"0 6px"}}>
                <p>Created On: {formatDate(issue.created_at)}</p>
                <p>Updated On: {formatDate(issue.updated_at)}</p>
              </div>
          </div>
        </div>
          
      </div>

      {isLoading && <Loading show={isLoading} />}
    </div>
  )
}


export default DetailsFull

