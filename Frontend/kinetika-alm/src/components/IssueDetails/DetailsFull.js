import { useState, useEffect, useCallback } from "react"
import './DetailsFull.css';
import { addComment, getComments, updateIssueStatus, getStatus, getUserList, getHistory } from "../../Service"
import { toast } from "react-toastify"


const DetailsFull = ( issue ) => {
    console.log(issue);
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
    if (!newComment.trim()) {
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
        {/* <button onClick={handleAddTicket}>Create</button> */}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors"
          >
            {issue.issue_key}
          </span>
          
        </div>
        
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-6 p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Description</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] font-sans"
              maxLength={500}
            />
            <div className="flex justify-end">
              <button onClick={saveChanges}>Save</button>
            </div>
          </div>

          <div defaultValue="comments" value={activeTab} onValueChange={setActiveTab}>
              <button value="comments" className="flex-1">
                Comments
              </button>
              <button value="history" className="flex-1">
                History
              </button>

            <div value="comments" className="space-y-4 mt-4">
              <form onSubmit={handleCommentSubmit} className="space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment"
                  className="min-h-[120px] font-sans"
                  maxLength={500}
                />
                <div className="flex justify-end">
                  <button type="submit">Add Comment</button>
                </div>
              </form>

              <div className="space-y-4 mt-6">
                <h3 className="font-medium sticky top-0 bg-white py-2 z-10">Comments</h3>
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={index} className="flex gap-3 pb-4 border-b">
                      <div
                        className="flex items-center justify-center h-9 w-9 rounded-full text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: getRandomColor() }}
                      >
                        {comment.username && typeof comment.username === "string"
                          ? comment.username
                              .split(" ")
                              .map((word) => word.charAt(0).toUpperCase())
                              .join("")
                          : ""}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{comment.username || "Undefined"}</span>
                          <span className="text-xs text-gray-500">{formatTime(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-700">{comment.comment_text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No comments yet. Be the first to add one!</p>
                )}
              </div>
            </div>

            <div value="history" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="font-medium sticky top-0 bg-white py-2 z-10">History</h3>
                {history.length > 0 ? (
                  history.map((entry, index) => (
                    <div key={index} className="flex gap-3 pb-4 border-b">
                      <div
                        className="flex items-center justify-center h-9 w-9 rounded-full text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: getRandomColor() }}
                      >
                        {entry.username && typeof entry.username === "string"
                          ? entry.username
                              .split(" ")
                              .map((word) => word.charAt(0).toUpperCase())
                              .join("")
                          : ""}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{entry.username || "Undefined"}</span>
                          <span className="text-xs text-gray-500">{formatTime(entry.updated_at)}</span>
                        </div>
                        <div className="text-gray-700">
                          {entry.field_changed === "Comment Added" ? (
                            <span> Added a comment.</span>
                          ) : entry.field_changed === "Issue Created" ? (
                            <span> Created an issue.</span>
                          ) : entry.field_changed === "assignee" ? (
                            <span>
                              {" "}
                              Assigned the issue to <span className="font-medium">{entry.new_value}</span>.
                            </span>
                          ) : entry.field_changed === "description" ? (
                            <span> Updated the issue description.</span>
                          ) : entry.field_changed === "priority" ? (
                            <span>
                              {" "}
                              Updated the issue priority from <span className="font-medium">{entry.old_value}</span> to{" "}
                              <span className="font-medium">{entry.new_value}</span>.
                            </span>
                          ) : entry.field_changed === "status" ? (
                            <span>
                              {" "}
                              Updated the issue status from{" "}
                              <span className="font-medium">
                                {statusList.find((s) => s.ID == entry.old_value)?.Name || "Unknown Status"}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {statusList.find((s) => s.ID == entry.new_value)?.Name || "Unknown Status"}
                              </span>
                              .
                            </span>
                          ) : (
                            <span>
                              {" "}
                              Updated the issue <span className="font-medium">{entry.field_changed}</span> from{" "}
                              <span className="font-medium">{entry.old_value}</span> to{" "}
                              <span className="font-medium">{entry.new_value}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No issue history present.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Details</h3>
                <button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className="p-0 h-auto"
                >
                  {/* <ChevronDown className={`h-5 w-5 transition-transform ${isDetailsOpen ? "rotate-180" : ""}`} /> */}
                </button>
              </div>

              {isDetailsOpen && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Assignee</label>
                    <select value={assignee} onValueChange={handleAssigneeChange} placeholder="Select assignee">
                        {users.map((user) => (
                          <option key={user.user_id} value={user.user_id}>
                            {user.full_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Status</label>
                    <select value={status} onValueChange={handleStatusChange}>
                      
                        {statusList.map((option) => (
                          <option key={option.ID} value={option.ID}>
                            {option.Name}
                          </option>
                        ))}
                     
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Priority</label>
                    <select value={priority} onValueChange={handlePriorityChange}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Reporter</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center h-9 w-9 rounded-full text-white font-bold text-sm"
                        style={{ backgroundColor: getRandomColor() }}
                      >
                        {issue.reporter_name && typeof issue.reporter_name === "string"
                          ? issue.reporter_name
                              .split(" ")
                              .map((word) => word.charAt(0).toUpperCase())
                              .join("")
                          : ""}
                      </div>
                      <span>{issue.reporter_name}</span>
                    </div>
                  </div>
                </div>
              )}

          </div>

          <div className="text-xs text-gray-400 px-1 space-y-1">
            <p>Created On: {formatDate(issue.created_at)}</p>
            <p>Updated On: {formatDate(issue.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


export default DetailsFull

