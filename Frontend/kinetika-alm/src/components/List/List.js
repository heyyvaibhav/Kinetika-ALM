import React, { useState, useEffect } from 'react';
import './List.css';
import SearchContainer from '../Search/Search';
import Select from "react-select"
import { getProject, getIssuesByProjectID, getStatus } from '../../Service';
import Loading from "../Templates/Loading"

function List() {
  const [tickets, setTickets] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [status, setStatus] = useState([]);

  useEffect(() => {
      const storedProjectIds = JSON.parse(localStorage.getItem("selectedProjectIds")) || [];
      if (storedProjectIds.length > 0) {
          setSelectedProjects(storedProjectIds);
          fetchIssues(storedProjectIds);
      }
  }, []);

  const getColumns = async () => {
    try {
      const response = await getStatus(`/status`)
      const statuses = response.statuses;
        
        const mapping = {};
        statuses.forEach(status => {
          mapping[status.ID] = status.Name;
        });
        setStatus(mapping);
    } catch (error) {
      console.error("Error fetching column statuses.", error)
    }
  }

  console.log(status);

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
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjectList([]);
    }
    setIsLoading(false);
  };

  const fetchIssues = async (projectIds) => {
      getColumns();
      setIsLoading(true);
      try {
          const response = await getIssuesByProjectID(`issues/projects?project_ids=${projectIds.join(",")}`);
          console.log("Project Issues:", response.issues);
  
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
    console.log("Selected Project:", selectedOption);
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
    }),
    menu: (provided) => ({
      ...provided,
      width: "80%", // Ensure dropdown menu width matches
      borderRadius: "8px",
      backgroundColor: "white",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
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

  return (
    <div className="list">
      <div className="list-header">
        <h2>Issue List</h2>
      </div>

      <SearchContainer />
      <Select
        isMulti
        value={projectList.length > 0 
          ? projectList.filter(opt => selectedProjects?.includes(opt.value)) 
          : []}
        options={projectList}
        styles={customStyles}
        onMenuOpen={fetchProjects}
        onChange={handleSelect}
        isLoading={isLoading}
        noOptionsMessage={() => (isLoading ? "Loading..." : "No projects found")}
        placeholder="Select a project"
      />

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
          {tickets.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center' , border:"none"}}>No data found</td>
            </tr>
          ) : (
            tickets.map(ticket => (
              <tr key={ticket.issue_id}>
                <td>{ticket.issue_key}</td>
                <td>{ticket.issue_type_id}</td>
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
                <td>{ticket.assignee_id}</td>
                <td>{ticket.reporter_id}</td>
                <td>{formatDate(ticket.created_at)}</td>
                <td>{formatDate(ticket.updated_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {isLoading && <Loading show={isLoading} />}
    </div>
  );
}

export default List;