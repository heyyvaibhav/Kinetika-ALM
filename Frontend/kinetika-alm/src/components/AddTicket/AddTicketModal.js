import React, { useState, useRef } from "react"
import axios from "axios"
import "./AddTicketModal.css"

export function AddTicketModal({ onclose }) {
  const [files, setFiles] = useState([])
  const [flagged, setFlagged] = useState(false)
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

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "your_cloudinary_upload_preset") // Replace with your Cloudinary upload preset

    const response = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload file to Cloudinary")
    }

    return response.json()
  }

  const handleSave = async () => {
    try {
      // Upload files to Cloudinary
      const uploadedFiles = await Promise.all(files.map((file) => uploadToCloudinary(file)))

      // Prepare ticket data
      const ticketData = {
        project: document.querySelector('select[name="project"]').value,
        issueType: document.querySelector('select[name="issueType"]').value,
        priority: document.querySelector('select[name="priority"]').value,
        status: document.querySelector('select[name="status"]').value,
        summary: document.querySelector('input[name="summary"]').value,
        description: document.querySelector(".editor-content").value,
        assignee: document.querySelector('select[name="assignee"]').value,
        team: document.querySelector('select[name="team"]').value,
        reporter: document.querySelector('select[name="reporter"]').value,
        flagged: flagged,
        attachments: uploadedFiles.map((file) => file.secure_url),
      }

      // Send ticket data to API
      const response = await axios("http://localhost:5000/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      })

      if (!response.ok) {
        throw new Error("Failed to create ticket")
      }

      const result = await response.json()
      console.log("Ticket created:", result)
      onclose()
    } catch (error) {
      console.error("Error creating ticket:", error)
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
            <select className="select-input" name="project">
              <option disabled>Select a Project</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Issue Type<span className="required">*</span>
            </label>
            <select className="select-input" name="issueType">
              <option>Task</option>
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
            <input type="text" className="text-input" placeholder="Enter summary" name="summary" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <div className="rich-editor">
              <textarea className="editor-content" placeholder="Enter the Description" />
            </div>
          </div>

          <div className="form-group">
            <label>Assignee</label>
            <select className="select-input" name="assignee">
              <option value="">Select assignee</option>
              <option value="unassigned">Unassigned</option>
              <option value="current-user">Current User</option>
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
              <option value="current-user">Current User</option>
              <option value="other">Other</option>
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
            <input type="checkbox" className="checkbox-input" checked={flagged} onChange={handleFlaggedChange} />
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
    </div>
  )
}

