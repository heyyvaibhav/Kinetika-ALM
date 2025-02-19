import React, { useState, useRef, useEffect } from "react"
import "./AddTicketModal.css"
import { getProject, createIssue, getUserList } from "../../Service"
import { toast } from "react-toastify"
import { issue_type } from "../DropdownOptions"
import Loading from "../Templates/Loading"
import { NewRelicConfig } from "../../environment"

export function AddTicketModal({ onclose , statusList }) {
  const [file, setFile] = useState([])
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
            setFile(url);

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
      formData.append("assignee_id", document.querySelector('select[name="assignee"]').value)
      formData.append("team", document.querySelector('select[name="team"]').value)
      formData.append("reporter_id", document.querySelector('select[name="reporter"]').value)
      formData.append("flagged", flagged ? 1 : 0)

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
            <select className="select-input" defaultValue="1" name="status">
            {statusList.map((status) => (
              <option key={status.ID} value={status.ID}>
                {status.Name}
              </option>
            ))}
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
              <input type="file" multiple className="file-input" />
              <p>
                <b>Drag and Drop</b> files here or{" "}
                <button type="button" onClick={initializeCloudinaryWidget}>
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

