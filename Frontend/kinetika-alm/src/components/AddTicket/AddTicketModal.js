import React, { useState, useRef, useEffect } from "react"
import "./AddTicketModal.css"
import { getProject, createIssue, getUserList, uploadAttachment } from "../../Service"
import { toast } from "react-toastify"
import { issue_type } from "../DropdownOptions"
import Loading from "../Templates/Loading"
import { NewRelicConfig } from "../../environment"

export function AddTicketModal({ onclose , statusList }) {
  const [files, setFiles] = useState([])
  const [projectID, setProjectID] = useState()
  const [flagged, setFlagged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [projectList, setProjectList] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const userid = localStorage.getItem("userId");

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
          multiple: true,
          // clientAllowedFormats: ["jpeg", "jpg", "png", "pdf", "doc", "docx"],
          maxFileSize: 5 * 1024 * 1024, // 5 MB
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            const url = result.info.secure_url; // Extract the secure URL of the uploaded image
            const size = result.info.bytes >= 1048576
              ? (result.info.bytes / (1024 * 1024)).toFixed(2) + " MB"
              : (result.info.bytes / 1024).toFixed(2) + " KB";
            const name = result.info.original_filename;
            const format = result.info.format;
            setFiles((prevFiles) => [...prevFiles, { name, size, format, url }]);
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

  const handleAssignToMe = () => {
    const assigneeSelect = document.querySelector('select[name="Assignee"]');
    if (assigneeSelect) {
      assigneeSelect.value = userid;
      assigneeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  const handleSave = async () => {
    const requiredFields = document.querySelectorAll('[required]');
    let allValid = true;

    requiredFields.forEach((field) => {
        if (!field.value.trim()) {
            field.classList.add('invalid-field');
            toast.error(`Please fill the ${field.name} field.`);
            allValid = false;
        } else {
            field.classList.remove('invalid-field');
        }
    });

    if (!allValid) return;

    try {
      setIsLoading(true)
      const formData = new FormData()

      // Append ticket data to formData
      formData.append("project_id", projectID)
      formData.append("issue_type_id", document.querySelector('select[name="issueType"]').value)
      formData.append("priority", document.querySelector('select[name="Priority"]').value)
      formData.append("status", document.querySelector('select[name="Status"]').value)
      formData.append("summary", document.querySelector('input[name="Summary"]').value)
      formData.append("description", document.querySelector('textarea[name="Description"]').value.trim());
      formData.append("assignee_id", document.querySelector('select[name="Assignee"]').value)
      formData.append("team", document.querySelector('select[name="team"]').value)
      formData.append("reporter_id", userid)
      formData.append("flagged", flagged ? 1 : 0)

      const response = await createIssue("/issues", formData)
      const issueID = response.issue_id;

      for (const file of files) {
        await uploadAttachment(`/issues/attachments/${issueID}/attachments`, {
          filename: file.name,
          filesize: file.size,
          fileurl: file.url,
          uploaded_by: userid,
        });
      }

      setFiles([])
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
      <div className="modal-container" style={{width: "800px"}}>
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
              <select className="form-control" name="project" defaultValue="" required value={projectID} onChange={(e) => setProjectID(e.target.value)}>
                <option value="" disabled hidden>Select a Project</option>
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
            <select className="form-control" name="issueType" required>
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
            <select className="form-control" name="Priority">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select className="form-control" defaultValue="1" name="Status">
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
            <input type="text" maxLength={255} className="form-control" placeholder="Enter summary" name="Summary" style={{width:"100%"}} required />
          </div>

          <div className="form-group">
            <label>Description<span className="required">*</span></label>
            
              <textarea style={{height:"80px"}} name="Description" className="form-control" maxLength={500} placeholder="Enter the Description" required/>
            
          </div>

          <div className="form-group">
            <label>Assignee<span className="required">*</span></label>
            <select className="form-control" name="Assignee" required>
              <option value="">Select assignee</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name}
                </option>
              ))}
            </select>
            <strong className="assign-to-me" onClick={handleAssignToMe} style={{cursor: 'pointer', color: 'blue', margin:"0 8px"}}>Assign to me</strong>
          </div>

          <div className="form-group">
            <label>Team</label>
            <select className="form-control" name="team">
              <option value="" disabled>
                Select Team
              </option>
            </select>
          </div>

          {/* <div className="form-group">
            <label>Reporter</label>
            <select className="select-input" name="reporter">
              <option value="">Select reporter</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div> */}

          <div className="form-group">
            <label>Reporter</label>
            <input className="form-control" style={{width:"100%"}} value={users.find(user => String(user.user_id) === String(userid))?.full_name || "Reporter not found"}  disabled/>
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
                  // <li key={index}> {file.name}.{file.format} </li>
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
            <button type="button" className="btn btn-outline" onClick={onclose}>
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

