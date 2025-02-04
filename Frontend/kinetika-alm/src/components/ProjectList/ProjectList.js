import React, { useState, useEffect } from 'react';
import { getProject } from '../../Service';
import './ProjectList.css';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProject("/projects");
        setProjects(response);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch projects. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  function formatDate(isoString) {
    const date = new Date(isoString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="active-projects-table-container">
      <h2>Active Projects</h2>
      
        <table style={{overflowX:"auto !important"}}>
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Project Name</th>
              <th>Project Key</th>
              <th>Project Description</th>
              <th>Lead on Project</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>No data found</td>
              </tr>
            ) : 
              projects.map((project) => (
              <tr key={project.project_id}>
                <td>{project.project_id}</td>
                <td>{project.project_name}</td>
                <td>{project.project_key}</td>
                <td>{project.project_description}</td>
                <td>{project.lead_id}</td>
                <td>{formatDate(project.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      
    </div>
  );
};

export default ProjectList;
