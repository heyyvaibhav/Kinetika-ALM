import React from "react";
import "./Project.css";

export default function ProjectForm() {
  return (
    <div className="project-form">
        <div className="project-header">
            <h2>Project details</h2>
        </div>
      <div className="form-container">
        <div className="form-header">
          <p className="form-description">
            Explore what's possible when you collaborate with your team. Edit project details anytime in project
            settings.
          </p>
        </div>

        <div className="form-section">
          <div className="mb-4">
            <label htmlFor="name" className="text-sm font-medium">
              Name <span className="required-field">*</span>
            </label>
            <input id="name" placeholder="Try a team name, project goal, milestone..." className="mt-1" />
          </div>

          <div className="mb-4">
            <label htmlFor="key" className="text-sm font-medium flex items-center">
              Key <span className="required-field">*</span>
              <button variant="ghost" size="sm" className="help-icon" title="Learn more about project keys">
                ?
              </button>
            </label>
            <input id="key" className="mt-1" />
          </div>

          {/* <div className="flex items-center space-x-2">
            <checkbox id="share" />
            <label htmlFor="share" className="text-sm">
              Share settings with an existing project
            </label>
          </div> */}
        </div>


        <div className="footer">
          <button>Create project</button>
        </div>
      </div>
    </div>
  )
}

