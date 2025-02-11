import React, { useState } from "react"
import "./Project.css"
import { createProject } from "../../Service"

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const userId = localStorage.getItem("userId");

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("Submitting form data:", formData)

    const data = {
      project_name : formData.name,
      project_key : formData.key,
      project_description : formData.description,
      lead_id : userId,
    }

    try {
      const response = await createProject("/projects", data)

      console.log("Response status:", response.status) // Log the response status

      const result = await response.json()
      console.log("Project created:", result)
      // Reset form or redirect user
      setFormData({ name: "", key: "", description: "" })
    } catch (err) {
      console.error("Error submitting form:", err) // Log any errors
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="project-form">
      <div className="project-header">
        <h2>Project Details</h2>
      </div>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-header">
          <p className="form-description">
            Explore what's possible when you collaborate with your team. Edit project details anytime in project
            settings.
          </p>
          <p className="form-description" style={{ fontSize: "12px" }}>
            <i>Required fields are marked with an asterisk</i>
            <span className="required-field">*</span>
          </p>
        </div>

        <div style={{display:"flex", alignItems:"center", justifyContent:"space-evenly"}}>
          <div className="form-section" style={{ width: "350px"}}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Name<span className="required-field">*</span>
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Try a team name, project goal, milestone..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="key" className="form-label">
                Key
                <img
                  alt="info"
                  src="/info.svg"
                  style={{ height: "15px", marginLeft: "1px", marginBottom: "-2px" }}
                  title="Learn more about project keys"
                />
                <span className="required-field">*</span>
              </label>
              <input
                id="key"
                name="key"
                value={formData.key}
                onChange={handleChange}
                placeholder="Enter a project key"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
                <span className="required-field">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter the description"
                required
              ></textarea>
            </div>
          </div>

          <img src="/projectpage.svg" width="200"/>
        </div>

        <div className="footer">
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create project"}
          </button>
        </div>
      </form>
    </div>
  )
}

