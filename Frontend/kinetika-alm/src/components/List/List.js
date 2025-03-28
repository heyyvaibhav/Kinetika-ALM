import React, { useState, useEffect, useMemo } from 'react';
import './List.css';
import SearchContainer from '../Search/Search';
import Select from "react-select"
import { getProject, getIssuesByProjectID, getStatus, getUserList } from '../../Service';
import Loading from "../Templates/Loading"
import { AddTicketModal } from '../AddTicket/AddTicketModal';
import IssueDetails from '../IssueDetails/IssueDetails';
import { toast } from 'react-toastify';
import { issue_type } from '../DropdownOptions';
import Pagination from "../Templates/Pagination";
import HeaderNav from "../Templates/HeaderNav";

function List() {
  const [tickets, setTickets] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [status, setStatus] = useState([]);
  const [ticketModal, setTicketModal] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [issueDetail, setIssueDetail] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("nor");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState({ priority: "", status: "", assignee: "", reporter: "" });
  const [users, setUsers] = useState([]);
  const [duplicateArray, setDuplicateArray] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageButtons = 5;

  useEffect(() => {
    const storedProjectIds = JSON.parse(localStorage.getItem("selectedProjectIds")) || [];
    if (storedProjectIds.length > 0) {
        setSelectedProjects(storedProjectIds);
        fetchIssues(storedProjectIds);
    }
    getColumns();
    if (projectList.length === 0) fetchProjects();
  }, []);

  const getColumns = async () => {
    try {
      const response = await getStatus(`/status`)
      const statuses = response.statuses;
      setStatusList(statuses);
      
      const mapping = {};
      statuses.forEach(status => {
        mapping[status.ID] = status.Name;
      });
      setStatus(mapping);
    } catch (error) {
      console.error("Error fetching column statuses.", error)
    }
  }

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await getProject("/projects");
      if (response) {
        const projectOptions = response.map((project) => ({
          value: project.project_id,
          label: project.project_name,
        }));
        setProjectList(projectOptions);
        localStorage.setItem("projectList", JSON.stringify(projectOptions));
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjectList([]);
    }
    setIsLoading(false);
  };

  const fetchIssues = async (projectIds, queryString = "") => {
    if ((!projectIds || projectIds.length === 0) || !selectedProjects) {
        toast.warning("No Project IDs provided.");
        setTickets([]);
        return;
    }

    getColumns();
    setIsLoading(true);

    try {
        const response = await getIssuesByProjectID(`issues/projects?project_ids=${projectIds.join(",")}${queryString}`);

        response.issues.forEach((issue) => {
            const issueId = issue.issue_id;
            if (!issueId) return;
        });

        setTickets(response.issues);
    } catch (error) {
        console.error("Failed to fetch project issues:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSelect = async (selectedOption) => {
    // console.log("Selected Project:", selectedOption);
    setIsLoading(true);

    try {
        // Extract project IDs
        const projectIds = Array.isArray(selectedOption)
            ? selectedOption.map(opt => opt.value)
            : [selectedOption.value];

        // Save to local storage
        localStorage.setItem("selectedProjectIds", JSON.stringify(projectIds));

        // Update state to persist selection
        setSelectedProjects(projectIds);

        // Fetch issues
        fetchIssues(projectIds);
    } catch (error) {
        console.error("Failed to fetch project issues:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCloseTicket = () => {
    setIssueDetail(false)
    setTicketModal(false)
    setSelectedIssue(null)
    if (selectedProjects && selectedProjects.length > 0) fetchIssues(selectedProjects);
  };

  const handleTicketDetail = (issue) => {
    setSelectedIssue(issue)
    setIssueDetail(true)
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      width: "80%",
      borderRadius: "8px",
      backgroundColor: state.isFocused ? "#f0f0f0" : "white",
      borderColor: state.isFocused ? "#4a90e2" : "#ccc",
      boxShadow: state.isFocused ? "0 0 5px rgba(74, 144, 226, 0.5)" : "none",
      "&:hover": {
        borderColor: "#4a90e2",
      },
      marginBottom: "20px",
      "@media (max-width: 500px)": {
        width: "100%",
      },
    }),
    menu: (provided) => ({
      ...provided,
      width: "80%",
      borderRadius: "8px",
      backgroundColor: "white",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      "@media (max-width: 500px)": {
        width: "100%",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      width: provided,
      backgroundColor: state.isSelected ? "#4a90e2" : state.isFocused ? "#e6f0ff" : "white",
      color: state.isSelected ? "white" : "black",
      padding: "10px 15px",
      "&:hover": {
        backgroundColor: "#e6f0ff",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#333",
      fontWeight: "500",
    }),
  };

  function formatDate(isoString) {
    const date = new Date(isoString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  const handleAddTicket = () => {
    setTicketModal(true)
  }

  const handleFilter = () => {
    fetchUsers();
    setFilterModalOpen(true);
  }
  const handleReset = () => {
    setFilters({ priority: "", status: "", assignee: "", reporter: "" });
  }
  const closeFilter = () => {
    setFilterModalOpen(false);
  }
  const applyFilters = async () => {
    setFilterModalOpen(false);
    setIsLoading(true);

    try {
      let queryParams = [];

      if (filters.priority) queryParams.push(`priority=${filters.priority}`);
      if (filters.status) queryParams.push(`status=${filters.status}`);
      if (filters.assignee) queryParams.push(`assignee=${filters.assignee}`);
      if (filters.reporter) queryParams.push(`reporter=${filters.reporter}`);

      const queryString = queryParams.length ? `&${queryParams.join("&")}` : "";
      
      await fetchIssues(selectedProjects, queryString); 
    } catch (err) {
        console.error("Failed to apply filters. Please try again later.", err);
    } finally {
        setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    (!searchTerm 
      || ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) 
      || ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      || ticket.issue_key.toLowerCase().includes(searchTerm.toLowerCase())
      || issue_type.find(type => type.issue_type_id === ticket.issue_type_id)?.issue_type_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (!selectedStatus || ticket.status === selectedStatus)
  );

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      if (sortOrder === "nor") return 0; // No sorting when "nor" is selected
      return sortOrder === "asc"
        ? a.issue_key.localeCompare(b.issue_key)
        : b.issue_key.localeCompare(a.issue_key);
    });
  }, [tickets, sortOrder]);
  

  const fetchUsers = async () => {
    try {
      const response = await getUserList("/users")
      const usersArray = Array.isArray(response.data) ? response.data : [response.data]
      setUsers(usersArray)
      setIsLoading(false)
    } catch (error) {
      console.error(error.message)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    setDuplicateArray(sortedTickets.slice(startIndex, endIndex));
  }, [sortedTickets, currentPage]);


  const getVisiblePages = () => {
    const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);

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
    const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);
    const remainingPages = totalPages - currentPage;

    return remainingPages >= maxPageButtons - 2;
  };

  return (
    <div className="list">
      {/* <div className="list-header">
        <h2>Issue List</h2>
        <button onClick={handleAddTicket}>Create</button>
      </div> */}
      <HeaderNav 
        name="Issue List"
        button_name="Create"
        buttonClick={handleAddTicket}
      />

      <SearchContainer 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        setSortOrder={setSortOrder} 
        handleFilter={handleFilter} 
        view="list" 
      />

      <Select
        isMulti
        value={projectList.length > 0 
          ? projectList.filter(opt => selectedProjects?.includes(opt.value)) 
          : []}
        options={projectList}
        styles={customStyles}
        onMenuOpen={fetchProjects}
        onChange={(selectedOptions) => {
          const selectedIds = selectedOptions.map((opt) => opt.value);
          setSelectedProjects(selectedIds);
          localStorage.setItem("selectedProjectIds", JSON.stringify(selectedIds));
          fetchIssues(selectedIds);
        }}
        isLoading={isLoading}
        noOptionsMessage={() => (isLoading ? "Loading..." : "No projects found")}
        placeholder="Select a project"
      />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Issue Key</th>
              <th>Issue Type ID</th>
              <th>Summary</th>
              <th>Description</th>
              <th>Priority</th>
              <th style={{textAlign:"center", width:"100px"}}>Status</th>
              <th>Assignee</th>
              <th>Reporter</th>
              <th>Created Date</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {duplicateArray.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center' }}>No data found</td>
              </tr>
            ) : (
              duplicateArray.map(ticket => (
                <tr key={ticket.issue_id} onClick={() => handleTicketDetail(ticket)}>
                  <td>{ticket.issue_key}</td>
                  <td>
                    {issue_type.find(type => type.issue_type_id === ticket.issue_type_id)?.issue_type_name || 'Unknown'}
                  </td>
                  <td>{ticket.summary}</td>
                  <td>{ticket.description}</td>
                  <td>{ticket.priority}</td>
                  <td>
                    <span
                      style={{ 
                        fontSize: "12px",
                        display: "inline-block",  
                        padding: "4px",      
                        minWidth: "80px",
                        textAlign: "center",      
                        fontWeight: "bold",
                        color: ticket.status == "3" ? "#1E7E34" : 
                              ticket.status == "2" ? "#D97706" : 
                              ticket.status == "1" ? "#DC3545" : "black" ,
                        backgroundColor: ticket.status == "3" ? "#E6F4EA" : 
                              ticket.status == "2" ? "#FEF3C7" : 
                              ticket.status == "1" ? "#FDE7E9" : "#ddd" ,
                        borderRadius:"10px", 
                      }}
                    >
                      {status[ticket.status]}
                    </span>
                  </td>
                  <td>{ticket.assignee_name}</td>
                  <td>{ticket.reporter_name}</td>
                  <td>{formatDate(ticket.created_at)}</td>
                  <td>{formatDate(ticket.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination 
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          shouldShowEllipses={shouldShowEllipses}
          duplicateArray={sortedTickets}
          itemsPerPage={itemsPerPage}
          visiblePages={visiblePages}
        />
      </div>
      
      {isLoading && <Loading show={isLoading} />}
      {ticketModal && <AddTicketModal onclose={handleCloseTicket} statusList={statusList} />}{" "}
      {issueDetail && selectedIssue && <IssueDetails issue={selectedIssue} onClose={handleCloseTicket} />} 

      {filterModalOpen && (
        <div className='modal-overlay'>
          <div className="filter-modal">
            <div className='filter-header'>
              <h3 style={{margin: "0"}}>Filter Issues</h3>
              <h3 onClick={closeFilter} style={{margin: "0"}}>X</h3>
            </div>
            <div className="modal-content">
              <div className='form-group'>
                <label>Priority</label>
                <select 
                  required
                  className="form-control"  
                  value={filters.priority} 
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className='form-group'>
                <label>Status</label>
                <select 
                  required
                  className="form-control"  
                  value={filters.status} 
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Select status</option>
                  {statusList.map((status) => (
                    <option key={status.ID} value={status.ID}>{status.Name}</option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <label>Assignee</label>
                <select 
                  required
                  className="form-control"  
                  value={filters.assignee} 
                  onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                >
                  <option value="">Select assignee</option>
                  {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>{user.full_name}</option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <label>Reporter</label>
                <select 
                  required
                  className="form-control"  
                  value={filters.reporter} 
                  onChange={(e) => setFilters({ ...filters, reporter: e.target.value })}
                >
                  <option value="">Select reporter</option>
                  {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>{user.full_name}</option>
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
}

export default List;