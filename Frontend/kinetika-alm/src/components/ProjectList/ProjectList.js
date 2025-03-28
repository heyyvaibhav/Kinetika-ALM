import React, { useState, useEffect } from 'react';
import { getProject, getUserList } from '../../Service';
import './ProjectList.css';
import Loading from '../Templates/Loading';
import { useNavigate } from "react-router-dom";
import SearchContainer from "../Search/Search";
import Pagination from '../Templates/Pagination';
import HeaderNav from '../Templates/HeaderNav';

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("nor");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ lead: "" });
  const [duplicateArray, setDuplicateArray] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageButtons = 5;

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
      return sortOrder === "nor" ? null : sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
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
  const handleReset = () => {
    setFilters({ lead:"" });
  }
  const closeFilter = () => {
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

  useEffect(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
  
      setDuplicateArray(filteredProjects.slice(startIndex, endIndex));
    }, [filteredProjects, currentPage]);
  
  
    const getVisiblePages = () => {
      const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  
      let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = startPage + maxPageButtons - 1;
  
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
      }
  
      return Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      );
    };
  
    const visiblePages = getVisiblePages();
  
  
    const shouldShowEllipses = () => {
      const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
      const remainingPages = totalPages - currentPage;
  
      return remainingPages >= maxPageButtons - 2;
    };
  


  return (
    <div className="active-projects-table-container">
      {/* <div className='list-header'>
        <h2>Active Projects</h2>
        <button onClick={handleCreateProject}>Create Project</button>
      </div> */}

      <HeaderNav
        name="Projects"
        button_name="Create Project"
        buttonClick={handleCreateProject}
      />
      
      <SearchContainer searchTerm={searchTerm} setSearchTerm={setSearchTerm} setSortOrder={setSortOrder} handleFilter={handleFilter} />
      
      <div className='table-container'>
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
            {duplicateArray.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No data found</td>
              </tr>
            ) : (
              duplicateArray.map((project) => (
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
        <Pagination 
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          shouldShowEllipses={shouldShowEllipses}
          duplicateArray={filteredProjects}
          itemsPerPage={itemsPerPage}
          visiblePages={visiblePages}
        />
      </div>
      
      {isLoading && <Loading show={isLoading} />}

      {filterModalOpen && (
        <div className='modal-overlay'>
          <div className="filter-modal">
            <div className='filter-header'>
              <h3 style={{margin: "0"}}>Filter Projects</h3>
              <h3 onClick={closeFilter} style={{margin: "0"}}>X</h3>
            </div>
            <div className="modal-content">
              <div className='form-group'>
                <label>Lead Name</label>
                <select 
                  className="form-control" 
                  required onClick={fetchUsers} 
                  onChange={(e) => setFilters({ ...filters, lead: e.target.value })}
                  value={filters.lead}
                >
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
            <div>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset</button>
              </div>
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
