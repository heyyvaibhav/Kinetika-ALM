import React, { useState, useRef, useEffect } from "react"
import "./AddTicketModal.css"
import { getProject, createIssue, getUserList } from "../../Service"
import { issue_type } from "../DropdownOptions"
import Loading from "../Templates/Loading"

export function AddTicketModal({ onclose }) {
  const [files, setFiles] = useState([])
  const [flagged, setFlagged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [projectList, setProjectList] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files))
  }

  const handleFlaggedChange = (event) => {
    setFlagged(event.target.checked)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setFiles(Array.from(event.dataTransfer.files))
  }

  const handleBrowseClick = () => {
    fileInputRef.current.click()
  }

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
        const response = await getProject("/projects"); // Assuming the response is an array directly

        if (Array.isArray(response)) {
            const projectOptions = response.map((project) => ({
                value: project.project_id,
                label: project.project_name,
            }));
            setProjectList(projectOptions);
        } else {
            setProjectList([]); // Reset if the response is not an array
        }
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjectList([]); // Reset in case of error
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

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
  // const uploadToCloudinary = async (file) => {
  //   const formData = new FormData()
  //   formData.append("file", file)
  //   formData.append("upload_preset", "your_cloudinary_upload_preset") // Replace with your Cloudinary upload preset

  //   const response = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
  //     method: "POST",
  //     body: formData,
  //   })

  //   if (!response.ok) {
  //     throw new Error("Failed to upload file to Cloudinary")
  //   }

  //   return response.json()
  // }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const formData = new FormData()

      // Append ticket data to formData
      formData.append("project_id", document.querySelector('select[name="project"]').value)
      formData.append("issue_type_id", document.querySelector('select[name="issueType"]').value)
      formData.append("priority", document.querySelector('select[name="priority"]').value)
      formData.append("status", document.querySelector('select[name="status"]').value)
      formData.append("summary", document.querySelector('input[name="summary"]').value)
      formData.append("description", document.querySelector(".editor-content").value)
      formData.append("assignee", document.querySelector('select[name="assignee"]').value)
      formData.append("team", document.querySelector('select[name="team"]').value)
      formData.append("reporter", document.querySelector('select[name="reporter"]').value)
      formData.append("flagged", flagged)

      // Append files to formData
      files.forEach((file) => {
        formData.append("attachments", file)
      })

      // Call the createTicket function from your Service.js
      const response = await createIssue("/issues", formData)

      console.log("Ticket created:", response)
      setIsLoading(false)
      onclose()
    } catch (error) {
      console.error("Error creating ticket:", error)
      setIsLoading(false)
      // Handle error (e.g., show error message to user)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2>Create</h2>
          <div className="modal-actions">
            <button className="icon-button" onClick={onclose}>
              <h1 className="close-icon">X</h1>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="modal-content">
          <div className="form-group">
              <label>
                  Project<span className="required">*</span>
              </label>
              <select className="select-input" name="project" defaultValue="">
                  <option value="" disabled>Select a Project</option>
                  {isLoading ? (
                      <option>Loading...</option>
                  ) : (
                      projectList.length > 0 ? (
                          projectList.map((project) => (
                              <option key={project.value} value={project.value}>
                                  {project.label}
                              </option>
                          ))
                      ) : (
                          <option disabled>No projects available</option>
                      )
                  )}
              </select>
          </div>

          <div className="form-group">
            <label>
              Issue Type<span className="required">*</span>
            </label>
            <select className="select-input" name="issueType">
            <option value="" disabled>Select an Issue Type</option>
            {issue_type.map((type) => (
              <option key={type.issue_type_id} value={type.issue_type_id}>
                {type.issue_type_name}
              </option>
            ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Priority<span className="required">*</span>
            </label>
            <select className="select-input" name="priority">
              <option>Low</option>
              <option>Mid</option>
              <option>High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select className="select-input" defaultValue="todo" name="status">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <p className="help-text">This is the initial status upon creation</p>
          </div>

          <div className="form-group">
            <label>
              Summary<span className="required">*</span>
            </label>
            <input type="text" maxLength={255} className="text-input" placeholder="Enter summary" name="summary" style={{width:"100%"}} />
          </div>

          <div className="form-group">
            <label>Description</label>
            
              <textarea className="editor-content" maxLength={500} placeholder="Enter the Description" />
            
          </div>

          <div className="form-group">
            <label>Assignee</label>
            <select className="select-input" name="assignee">
              <option value="">Select assignee</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name}
                </option>
              ))}
            </select>
            <span>Assign to me</span>
          </div>

          <div className="form-group">
            <label>Team</label>
            <select className="select-input" name="team">
              <option value="" disabled>
                Select Team
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Reporter</label>
            <select className="select-input" name="reporter">
              <option value="">Select reporter</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Attachment</label>
            <div className="file-drop-zone" onDragOver={handleDragOver} onDrop={handleDrop}>
              <input type="file" multiple className="file-input" onChange={handleFileChange} ref={fileInputRef} />
              <p>
                <b>Drag and Drop</b> files here or{" "}
                <button type="button" onClick={handleBrowseClick}>
                  Browse
                </button>
              </p>
            </div>
            {files.length > 0 && (
              <ul className="file-list">
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label>Flagged</label>
            <input type="checkbox" className="checkbox-input" checked={flagged} onChange={handleFlaggedChange} style={{width:"20px", height:"14px", }} />
            Impediment
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={onclose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>

      {isLoading && <Loading show={isLoading} />}
    </div>
  )
}

