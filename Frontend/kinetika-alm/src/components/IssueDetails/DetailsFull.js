import { useState, useEffect, useCallback, useRef } from "react"
import './DetailsFull.css';
import { addComment, getComments, updateIssueStatus, getStatus, getUserList, getHistory, getAttachments, uploadAttachment } from "../../Service"
import { toast } from "react-toastify"
import RichTextEditor from "../Templates/TextEditor.js"
import { useLocation, useParams } from "react-router-dom";
import Loading from "../Templates/Loading.js"
import { TbDownload } from "react-icons/tb";
import { NewRelicConfig } from "../../environment";
import HeaderNav from "../Templates/HeaderNav";

const DetailsFull = () => {
  // const location = useLocation();
  const issue = JSON.parse(localStorage.getItem("browseIssue"));
  const [isDetailsOpen, setIsDetailsOpen] = useState(true)
  const [assignee, setAssignee] = useState(issue.assignee_id)
  const [status, _setStatus] = useState(issue.status)
  const [priority, _setPriority] = useState(issue.priority)
  const [activeTab, setActiveTab] = useState("comments")
  const [description, setDescription] = useState(issue.description)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState([])
  const [history, setHistory] = useState([])
  const [attachments, setAttachments] = useState([])
  const [statusList, setStatusList] = useState([])
  const [users, setUsers] = useState([])
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const userid = localStorage.getItem("userId");

  const setStatus = (value) => {
    _setStatus(value);
  };
  const setPriority = (value) => {
    _setPriority(value); 
  };

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

    return `${month} ${day}, ${year} at ${formattedHours}:${minutes} ${amPm}`
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

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  const data = {
    "description": description,
    "assignee_id": assignee,
    "status": status,
    "priority": priority,
    "userid" : userid,
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

  const fetchAttachments = async () => {
    try {
      const response = await getAttachments(`/issues/attachments/${issue.issue_id}/attachments`)
      setAttachments(response.data)
    } catch (error) {
      console.error("Error fetching attachments:", error)
    }
  }

  const handleAttachment = (entry) => {
    const link = document.createElement("a");
    link.href = entry.file_url; // or whatever field has the URL
    link.download = entry.file_name; // suggested filename
    link.target = "_blank";
    link.click();
  };

  const AttachmentUpload = async () => {
    try {
      setIsLoading(true)
      await uploadAttachment(`/issues/attachments/${issue.issue_id}/attachments`, {
        filename: files[0]?.name,
        fileurl: files[0]?.url,
        uploaded_by: userid,
      });

      setFiles([])
      fetchAttachments()
    } catch (error) {
      console.error("Error creating ticket:", error)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    getColumns()
  }, [fetchUsers, getColumns])

  useEffect(() => {
    if (activeTab === "comments") fetchComments()
    if (activeTab === "history") fetchHistory()
    if (activeTab === "attachments") fetchAttachments()
  }, [activeTab])

  const handleCommentSubmit = async (e) => {
    setNewComment("");
    e.preventDefault()
    const cleanedComment = newComment.replace(/&nbsp;|<p>|<\/p>|<br\s*\/?>|\n|\r/g, "").trim();

    if (!newComment || !cleanedComment) {
      toast.warning("Comments can not be empty!")
      return;
    }

    try {
      await addComment(`/issues/comments/${issue.issue_id}/comments`, {
        user_id: userid,
        comment_text: newComment,
      })

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

  const widgetsRef = useRef();
  const initializeCloudinaryWidget = () => {
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
            multiple: true, // Single upload only
            clientAllowedFormats: ["jpeg", "jpg", "png", "pdf", "doc", "docx"], // Acceptable formats
            maxFileSize: 5 * 1024 * 1024, // 5 MB
          },
          (error, result) => {
            if (!error && result && result.event === "success") {
              const url = result.info.secure_url; // Extract the secure URL of the uploaded image
              const name = result.info.original_filename;
              const format = result.info.format;
              setFiles([{ name, format, url }]);
              widgetsRef.current.close(); // Close the widget after successful upload
              toast.success("Photo uploaded successfully!!", {
                zIndex: 5000, // Correct syntax for custom zIndex
              });
              setIsLoading(false);
            } else if (error) {
              if (
                error?.status?.includes("exceeds maximum allowed (5 MB)") &&
                error?.statusText?.includes("File size")
              ) {
                toast.error(
                  "File size exceeds 5 MB. Please upload a smaller file."
                );
  
                widgetsRef.current.close();
              } else if (
                error?.status === "File format not allowed" &&
                error?.statusText?.includes("File format not allowed")
              ) {
                toast.error("File format not allowed");
  
                widgetsRef.current.close();
              }
              setIsLoading(false);
            }
          }
        );
      }
      setIsLoading(true);
      widgetsRef.current.open();
    };

  return (
    <div className="detail-background">
      <HeaderNav 
        name={`Issue Details - ${issue.issue_key}`}
        button_name="Save"
        buttonClick={saveChanges}
      />
      <div className="detailPage" style={{display:"flex"}}>
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
                style={{ height:"140px" }}
              />
            </div>

            <div className="tabs" style={{ width:"100%", justifyContent:"space-between", background:"#F1F5F9", padding:"4px 8px", borderRadius:"10px",marginBottom:"20px"}}>
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
                    <div style={{height:"40px", position:"sticky", top:"0", zIndex:"10", width:"100%", background:"white", alignItems:"center", boxShadow: "0 2px 3px -1px rgba(0, 0, 0, 0.1)", marginBottom:"10px"}}>
                      <h3 style={{ marginBottom:"10px" }}>Comments</h3>
                    </div>
                    {comments.length > 0 ? (
                      comments.map((comment, index) => (
                        <div key={index} className="comment">
                          <div 
                            className="avatar"
                            style={{ backgroundColor: '#3357FF', color: "#fff", fontWeight: "bold", height:"34px", width:"37.62px", fontSize:"14px"}}
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
                            <div><p dangerouslySetInnerHTML={{ __html: comment.comment_text }}></p></div>
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
                  <div className="history-section" style={{height: "550px"}}>
                    <div style={{height:"40px", position:"sticky", top:"0", zIndex:"10", width:"100%", background:"white", alignItems:"center", boxShadow: "0 2px 3px -1px rgba(0, 0, 0, 0.1)", marginBottom:"10px"}}>
                      <h3 style={{ marginBottom:"10px" }}>History</h3>
                    </div>

                    {history.length > 0 ? (
                      history.map((entry, index) => (
                        <div key={index} className="history">
                          <div 
                            className="avatar"
                            style={{ backgroundColor: '#3357FF', color: "#fff", fontWeight: "bold", height:"34px", width:"37.62px", fontSize:"14px"}}
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
                              ) : (entry.field_changed === "Attachment Added") ? (
                                <span> Added an attachment.</span>
                              ) : (entry.field_changed === "Issue Created") ? (
                                <span> Created an issue.</span>
                              ) : (entry.field_changed === "assignee") ? (
                                <span> Assigned the issue to <span className="b">{entry.new_value}</span>.</span>
                              ) : (entry.field_changed === "description") ? (
                                <span> Updated the issue description.</span>
                              ) : (entry.field_changed === "priority") ? (
                                <span> Updated the issue priority from <span className="b">{entry.old_value}</span> to <span className="b">{entry.new_value}</span>.</span>
                              ) : (entry.field_changed === "status") ? (
                                <span> Updated the issue status from <span style={{color:"#1D3557", textDecoration:"underline"}} className="b">{statusList.find(s => s.ID == entry.old_value)?.Name || 'Unknown Status'}</span> to <span style={{color:"#1D3557", textDecoration:"underline"}} className="b">{statusList.find(s => s.ID == entry.new_value)?.Name || 'Unknown Status'}</span>.</span>
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

              {activeTab === "attachments" && (
                <div>
                  <div className="history-section" style={{height: "550px"}}>
                    <div style={{height:"40px", position:"sticky", top:"0", zIndex:"10", width:"100%", background:"white", alignItems:"center", boxShadow: "0 2px 3px -1px rgba(0, 0, 0, 0.1)", marginBottom:"10px"}}>
                      <h3 style={{ marginBottom:"10px" }}>Attachments</h3>
                    </div>

                    {attachments.length > 0 ? (
                      attachments.map((entry, index) => (
                        <div key={index} className="history">
                          <div 
                            className="avatar"
                            style={{ backgroundColor: '#3357FF', color: "#fff", fontWeight: "bold", height:"34px", width:"37.62px", fontSize:"14px"}}
                          > 
                            {entry.username && typeof entry.username === "string"
                            ? entry.username
                                .split(" ")
                                .map(word => word.charAt(0).toUpperCase())
                                .join("")
                            : ""}
                          </div>
                          <div style={{width:"100%",  alignItems:"center", gap: "8px"}}>
                            <div style={{display:"flex", justifyContent:"space-between", gap:"4px",}}>
                              <strong>{entry.username || "Undefined"}</strong>
                              <small>{formatTime(entry.uploaded_at)}</small>
                            </div>
                            <div style={{display:"flex", justifyContent:"space-between"}}>
                              <div>{entry.file_name}</div>
                              <TbDownload color="#a6a4b2" size={20} onClick={() => window.open(entry.file_path, "_blank")} />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No Issue Attachments present.</p>
                    )}
                    <div style={{textAlign: "right", marginTop:"10px"}}>
                      {files.length === 0 ? (
                        <button onClick={initializeCloudinaryWidget}>Add Attachment</button>
                      ) : (
                        <button onClick={AttachmentUpload}>Save Attachment</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="detailright" style={{width:"35%", padding:"0 20px"}}>
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
                    <select className="form-control" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
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
                      className="form-control" 
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
                    <select className="form-control" value={priority} onChange={handlePriorityChange}>
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
                        style={{ backgroundColor: '#3357FF', color: "#fff", fontWeight: "bold", height:"34px", width:"34px", fontSize:"14px"}}
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
              <div style={{ textAlign: "center", fontSize:"13px", color:"#bfbfbf", padding:"0 6px"}}>
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

