import React, { useState, useEffect } from 'react';
import { getProject, getUserList } from '../../Service';
import './ProjectList.css';
import Loading from '../Templates/Loading';
import { useNavigate } from "react-router-dom";
import SearchContainer from "../Search/Search";

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProject("/projects");
        setProjects(response);
        setFilteredProjects(response);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch projects. Please try again later.');
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let updatedProjects = [...projects];

    if (searchTerm) {
      updatedProjects = updatedProjects.filter(project =>
        Object.values(project).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    updatedProjects.sort((a, b) => {
      const nameA = a.project_name.toLowerCase();
      const nameB = b.project_name.toLowerCase();
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    setFilteredProjects(updatedProjects);
  }, [searchTerm, sortOrder, filters, projects]);

  function formatDate(isoString) {
    const date = new Date(isoString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  const handleCreateProject = () => {
    navigate('/main/project');
  }

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

  const handleFilter = () => {
    setFilterModalOpen(true);
  }

  const closeFilter = () => {
    setFilters([]);
    setFilterModalOpen(false);
  }

  const applyFilters = async () => {
    setFilterModalOpen(false);
    setIsLoading(true);
    try {
        const queryParam = filters.lead ? `?lead=${filters.lead}` : "";
        const response = await getProject(`/projects${queryParam}`);
        setProjects(response);
        setFilteredProjects(response);
    } catch (err) {
        setError("Failed to apply filters. Please try again later.");
    }
    setIsLoading(false);
  };


  return (
    <div className="active-projects-table-container">
      <div className='list-header'>
        <h2>Active Projects</h2>
        <button onClick={handleCreateProject}>Create Project</button>
      </div>
      
      <SearchContainer searchTerm={searchTerm} setSearchTerm={setSearchTerm} setSortOrder={setSortOrder} handleFilter={handleFilter} />
      
      <table>
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
          {filteredProjects.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No data found</td>
            </tr>
          ) : (
            filteredProjects.map((project) => (
              <tr key={project.project_id}>
                <td>{project.project_id}</td>
                <td>{project.project_name}</td>
                <td>{project.project_key}</td>
                <td>{project.project_description}</td>
                <td>{project.lead_name}</td>
                <td>{formatDate(project.created_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {isLoading && <Loading show={isLoading} />}

      {filterModalOpen && (
        <div className='modal-overlay'>
          <div className="filter-modal">
            <div className='filter-header'>
              <h3 style={{margin: "0"}}>Filter Projects</h3>
              <h3 onClick={() => setFilterModalOpen(false)} style={{margin: "0"}}>X</h3>
            </div>
            <div className="modal-content">
              <div className='form-group'>
                <label>Lead Name</label>
                <select className="form-control" required onClick={fetchUsers} onChange={(e) => setFilters({ lead: parseInt(e.target.value) })}>
                <option value="">Select a name</option>
                {users.map(user => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
              </div>
            </div>
            <div className="filter-footer">
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-secondary" onClick={closeFilter}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={applyFilters}>
                    Apply
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );    
};

export default ProjectList;
