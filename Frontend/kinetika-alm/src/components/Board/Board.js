import { useState, useEffect, useMemo } from "react"
import "./Board.css"
import { AddTicketModal } from "../AddTicket/AddTicketModal.js"
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableItem } from "../Search/SortableItem.js"
import { SortableTicket } from "../Templates/SortableTicket.js"
import SearchContainer from "../Search/Search.js"
import { getProject, getIssuesByProjectID, getStatus, addStatus, deleteStatus, checkIssuesForStatus } from "../../Service.js"
import Select from "react-select"
import IssueDetails from "../IssueDetails/IssueDetails.js"
import Loading from "../Templates/Loading.js"
import { toast } from "react-toastify"

function Board() {
  const [columns, setColumns] = useState([])
  const [selectedProjects, setSelectedProjects] = useState([])
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [ticketModal, setTicketModal] = useState(false)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [issueDetail, setIssueDetail] = useState(false)
  const [projectList, setProjectList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [initialStatus, setInitialStatus] = useState("") 
  const [statusList, setStatusList] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [fallbackStatusId, setFallbackStatusId] = useState("")
  const [deletecolumn, setDeleteColumn] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("nor")
  const [showFilters, setShowFilters] = useState(false)
  const [filterPriority, setFilterPriority] = useState([])
  const [isModalOpening, setIsModalOpening] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event) => {
    // const { active, over } = event

    // if (!over) return

    // const activeId = active.id
    // const overId = over.id

    // // Find the source and destination columns
    // const sourceColumn = columns.find((col) => col.items.some((item) => item.id === activeId))
    // const destColumn = columns.find((col) => col.id === overId)

    // if (sourceColumn && destColumn) {
    //   setColumns((prevColumns) => {
    //     const newColumns = prevColumns.map((col) => {
    //       if (col.id === sourceColumn.id) {
    //         return {
    //           ...col,
    //           items: col.items.filter((item) => item.id !== activeId),
    //         }
    //       }
    //       if (col.id === destColumn.id) {
    //         return {
    //           ...col,
    //           items: [...col.items, sourceColumn.items.find((item) => item.id === activeId)],
    //         }
    //       }
    //       return col
    //     })
    //     return newColumns
    //   })
    // } else if (active.id !== over.id) {
    //   // Handle column reordering
    //   setColumns((items) => {
    //     const oldIndex = items.findIndex((item) => item.id === active.id)
    //     const newIndex = items.findIndex((item) => item.id === over.id)
    //     return arrayMove(items, oldIndex, newIndex)
    //   })
    // }
  }

  const getColumns = async () => {
    try {
      const response = await getStatus(`/status`)

      const statuses = response.statuses; // Extract array
      setStatusList(statuses);
      if (!Array.isArray(statuses)) {
          throw new Error("Invalid response format");
      }

      const newColumns = statuses.map((status) => ({
          id: status.ID,
          title: status.Name,
          items: [],
      }));

      setColumns(newColumns)
    } catch (error) {
      console.error("Error fetching column statuses.", error)
    }
  }

  const deleteColumn = async (columnId, fallbackStatusId) => {
    try {
        // Send as an object with the required key
        const response = await deleteStatus(`/status/delete/${columnId}`, {
            data: { fallbackStatusId: fallbackStatusId }
        });

        // Remove the column from state
        setColumns((prev) => prev.filter((col) => col.id !== columnId));

        fetchIssues(selectedProjects);
    } catch (error) {
        console.error("Error deleting column:", error);
    }
  };

  const handleDeleteClick = async (columnId) => {
    setDeleteColumn(columnId);
    setFallbackStatusId("");
    const response = await checkIssuesForStatus(`/status/check/${columnId}`);
    
    if (response.issuesPresent) {
        setShowModal(true);
    } else {
        deleteColumn(columnId, null);
    }
  };

  const confirmDelete = (columnId) => {
    if (fallbackStatusId) {
      deleteColumn(columnId, fallbackStatusId);
      setShowModal(false);
      setDeleteColumn("");
    }
  };

  const addNewColumn = async () => {
    if (!newColumnTitle.trim()) {
      toast.warning("Column title cannot be empty!")
      return
    }
    if (columns.length >= 10) {
      toast.error("You can't add more than 10 columns!")
      return
    }

    const payload = {
      name: newColumnTitle,
    }

    try {
      const response = await addStatus("/status", payload)

      // Add the column locally on success
      setColumns((prev) => [
        ...prev,
        {
          id: response.id,
          title: newColumnTitle,
          items: [],
        },
      ])

      setNewColumnTitle("")
      setIsAddingColumn(false)
      getColumns()
      fetchIssues(selectedProjects);
    } catch (error) {
      console.error("Error adding column:", error)
    }
  }

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const response = await getProject("/projects")
      if (response) {
        const projectOptions = response.map((project) => ({
          value: project.project_id,
          label: project.project_name,
        }))
        setProjectList(projectOptions)
        localStorage.setItem("projectList", JSON.stringify(projectOptions));
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      setProjectList([])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const storedProjectIds = JSON.parse(localStorage.getItem("selectedProjectIds")) || [];

    if (storedProjectIds.length > 0) {
        setSelectedProjects(storedProjectIds);
        fetchIssues(storedProjectIds);
    }

    getColumns();

    if (projectList.length === 0) {
        fetchProjects();
    }
  }, []);

  const fetchIssues = async (projectIds) => {
    if ((!projectIds || projectIds.length === 0) || !selectedProjects) {
      toast.warning("No Project IDs provided.")
      setColumns((prevColumns) =>
          prevColumns.map((col) => ({ ...col, items: [] }))
      );
      return;
    }

    setIsLoading(true)
    try {
      const response = await getIssuesByProjectID(`issues/projects?project_ids=${projectIds.join(",")}`)
      // console.log("Project Issues:", response.issues)

      setColumns((prevColumns) => {
        // ✅ **Ensure we start with empty items to avoid duplication**
        let newColumns = prevColumns.map((col) => ({ ...col, items: [] }));

        response.issues.forEach((issue) => {
            const issueId = issue.issue_id;
            if (!issueId) return;

            const issueItem = { ...issue, id: issueId };

            // Find the column for this issue
            const columnIndex = newColumns.findIndex((col) => col.id === issue.status);
            if (columnIndex !== -1) {
                newColumns[columnIndex] = {
                    ...newColumns[columnIndex], 
                    items: [...newColumns[columnIndex].items, issueItem]
                };
            } else if (newColumns.length > 0) {
                // If status_id doesn't match, add to the first column
                newColumns[0] = {
                    ...newColumns[0], 
                    items: [...newColumns[0].items, issueItem]
                };
            }
        });

        const uniqueAssignees = Array.from(
          new Map(response.issues.map(({ assignee_id, assignee_name }) => [assignee_id, { assignee_id, assignee_name }]))
          .values()
        );

        setAssignees(uniqueAssignees);


        // ✅ **Fix Priority Sorting**
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };

        newColumns = newColumns.map((column) => ({
            ...column,
            items: column.items.sort((a, b) => {
                return (priorityOrder[a.priority?.toLowerCase()] || 4) - (priorityOrder[b.priority?.toLowerCase()] || 4);
            }),
        }));

        return newColumns;
      })
    } catch (error) {
      console.error("Failed to fetch project issues:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = async (selectedOption) => {
    // console.log("Selected Project:", selectedOption)
    setIsLoading(true)

    try {
      // Extract project IDs
      const projectIds = Array.isArray(selectedOption) ? selectedOption.map((opt) => opt.value) : [selectedOption.value]

      // Save to local storage
      localStorage.setItem("selectedProjectIds", JSON.stringify(projectIds))

      // Update state to persist selection
      setSelectedProjects(projectIds)

      // Fetch issues
      fetchIssues(projectIds)
    } catch (error) {
      console.error("Failed to fetch project issues:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTicket = (columnId) => {
    if (isModalOpening) return; 
  
    setIsModalOpening(true);
    setTicketModal(true);
    setInitialStatus(columnId);
  
    setTimeout(() => {
      setIsModalOpening(false);
    }, 500); 
  };
  

  const handleCloseTicket = () => {
    setIssueDetail(false)
    setTicketModal(false)
    setSelectedIssue(null)
    if (selectedProjects && selectedProjects.length > 0) fetchIssues(selectedProjects);
  }
  const handleTicketDetail = (issue, event) => {
    if (event.ctrlKey || event.metaKey) {
      localStorage.setItem("browseIssue", JSON.stringify(issue));
      window.open(`/main/browse/${issue.issue_key}`, "_blank");
    } else {
      setSelectedIssue(issue);
      setIssueDetail(true);
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
  }

  function formatDate(isoString) {
    const date = new Date(isoString)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const month = monthNames[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()

    return `${month} ${day}, ${year}`
  }

  const getRandomColor = () => {
    const colors = [
        "#FF5733", "#3357FF", "#FF33A1", "#FF8C33", "#8C33FF",
        "#33FF57", "#FFC300", "#DAF7A6", "#C70039", "#900C3F",
        "#581845", "#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9",
        "#92A8D1", "#955251", "#B565A7", "#009B77", "#DD4132",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  // const acolor = useMemo(getRandomColor, []);

  const handleFilter = () => {
    setShowFilters(true);
  }
  const handleReset = () => {
    setFilterPriority([]);
    if (selectedProjects && selectedProjects.length > 0) fetchIssues(selectedProjects);
  }
  const closeFilter = () => {
    setShowFilters(false);
  }

  const filterpriority = () => {
    const filteredColumns = columns.map(column => ({
      ...column,
      items: column.items.filter(item =>
        filterPriority.length === 0 || 
        (item.priority && filterPriority.includes(item.priority.toLowerCase()))
      )
    }));
  
    setColumns(filteredColumns);
    setShowFilters(false);
  };

  const handleAssigneeClick = (assigneeId) => {
    setSelectedAssignee((prev) =>
        prev.includes(assigneeId)
            ? prev.filter((id) => id !== assigneeId)
            : [...prev, assigneeId]
    );
  };
  
  const filteredColumns = useMemo(() => {
    return columns.map(column => {
      const filteredItems = column.items.filter(item => {
        const matchesSearch = searchTerm === "" || 
          (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.issue_key && item.issue_key.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Filter by priority if filter is active
        // const matchesPriority = filterPriority.length === 0 || 
        //   (item.priority && filterPriority.includes(item.priority.toLowerCase()));
        
        const matchesAssignee = selectedAssignee.length === 0 || 
          (item.assignee_id && selectedAssignee.includes(item.assignee_id));

        return matchesSearch && matchesAssignee; // && matchesPriority;
      });

      const sortedItems = [...filteredItems].sort((a, b) => {
        const dateA = new Date(a.updated_at);
        const dateB = new Date(b.updated_at);
        
        return sortOrder === "nor" ? null : sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });

      return {
        ...column,
        items: sortedItems
      };
    });
  }, [columns, searchTerm, sortOrder, selectedAssignee]);

  return (
    <div className="board">
      <div className="board-header">
        <h2>Issue Board</h2>
        <button onClick={handleAddTicket}>Create</button>
      </div>
      <SearchContainer 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        setSortOrder={setSortOrder} 
        handleFilter={handleFilter} 
        view="board"
        assignees={assignees}
        selectedAssignees={selectedAssignee}
        onAssigneeClick={handleAssigneeClick}
        setSelectedAssignees={setSelectedAssignee}
      />
      <Select
        isMulti
        value={projectList.length > 0 ? projectList.filter((opt) => selectedProjects.includes(opt.value)) : []}
        options={projectList}
        styles={customStyles}
        onMenuOpen={fetchProjects}
        onChange={handleSelect}
        isLoading={isLoading}
        noOptionsMessage={() => (isLoading ? "Loading..." : "No projects found")}
        placeholder="Select a project"
      />
      {/* <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}> */}
        <div className="board-columns">
          {/* <SortableContext items={filteredColumns.map((col) => col.id)} strategy={verticalListSortingStrategy}> */}
            {filteredColumns.map((column) => (
              // <SortableItem >
                <div className="column" key={column.id} id={column.id} style={{  marginLeft : column.id == "1" ? "4px" : "0"}}>
                  <div className="column-header">
                    <div style={{ display: "flex" }}>
                      <img src="/plus-icon.svg" alt="Plus Icon" height="24" width="24" />
                    </div>
                    <h3 style={{ margin: "0" }}>{column.title}</h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor:
                          column.id == "1"
                            ? "#FFEDEC"
                            : column.id == "2"
                              ? "#E9EEFF"
                              : column.id == "3"
                                ? "#E9FAF2"
                                : "#FFF7E9",
                        borderRadius: "10px",
                        border:
                          column.id == "1"
                            ? "1px solid #E36A7A"
                            : column.id == "2"
                              ? "1px solid #6976C9"
                              : column.id == "3"
                                ? "1px solid #5DCE9F"
                                : "1px solid #E4B54F",
                        padding: "4px 8px",
                      }}
                    >
                      <img
                        src={
                          column.id == "1"
                            ? "/todo.svg"
                            : column.id == "2"
                              ? "/inProgress.svg"
                              : column.id == "3"
                                ? "/done.svg"
                                : "/fire.svg"
                        }
                        alt={`${column.id} Icon`}
                        height="20"
                        width="20"
                      />
                      <span
                        style={{
                          marginLeft: "8px",
                          fontWeight: "bold",
                          color:
                            column.id == "1"
                              ? "#E36A7A"
                              : column.id == "2"
                                ? "#6976C9"
                                : column.id == "3"
                                  ? "#5DCE9F"
                                  : "#E4B54F",
                        }}
                      >
                        {column.items.length}
                      </span>
                    </div>
                    {column.id != "1" && column.id != "2" && column.id != "3" && (
                      <button onClick={() => handleDeleteClick(column.id)} className="delete-column">
                        <img src="/delete.svg" style={{ width: "24px", height: "24px" }} alt="delete" />
                      </button>
                    )}
                  </div>

                  <div className="tickets">
                    {/* <SortableContext items={column.items.map((item) => item.id)} strategy={verticalListSortingStrategy}> */}
                      {column.items.map((item) => (
                        <SortableTicket key={item.issue_id} id={item.issue_id}>
                          <div className="ticket" onClick={(e) => handleTicketDetail(item, e)}>
                            <div style={{ borderBottom: "1px solid #ddd", marginBottom: "10px" }}>
                              <p style={{ marginBottom: "8px" }}>
                                {" "}
                                <img src="/selected_date.svg" style={{ height: "14px", marginBottom: "-2px" }} />{" "}
                                {formatDate(item.updated_at)}
                              </p>
                              <p>{item.summary || "No description"}</p>
                              <h5 style={{ marginBottom: "4px" }}>{item.issue_key || "Untitled Issue"}</h5>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "4px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    padding: "4px 8px 6px",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  <img src="/comment.svg" style={{ height: "24px", marginBottom: "-2.5px" }} />
                                  <span>{item.comment}</span>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    padding: "4px 8px 6px",
                                    alignItems: "center",
                                    gap: "5px",
                                  }}
                                >
                                  <img src="/attachment.svg" style={{ height: "20px", marginBottom: "-2.5px" }} />
                                  <span>{item.attachment}</span>
                                </div>
                              </div>
                              <div 
                                  className="avatar"
                                  style={{ backgroundColor: '#3357FF', color: "#fff", fontWeight: "bold", height:"34px", width:"34px", fontSize:"14px"}}
                              > 
                                  {item.assignee_name && typeof item.assignee_name === "string"
                                  ? item.assignee_name
                                      .split(" ")
                                      .map(word => word.charAt(0).toUpperCase()) // Extracts and capitalizes initials
                                      .join("")
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </SortableTicket>
                      ))}
                    {/* </SortableContext> */}
                  </div>

                  <button className="create-issue" onClick={() => handleAddTicket(column.id)}>
                    {" "}
                    {/* Updated Create Issue button */}
                    <u>Create Issue</u>
                  </button>
                </div>
              // </SortableItem>
            ))}
          {/* </SortableContext> */}

          {isAddingColumn ? (
            <div className="add">
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="New column title"
                className="form-control"
              />
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button onClick={addNewColumn}>
                  <img src="/tick.svg" width="30" />
                </button>
                <button onClick={() => setIsAddingColumn(false)}>
                  <img src="/cross.svg" width="30" />
                </button>
              </div>
            </div>
          ) : (
            <button className="addColumnbtn" onClick={() => setIsAddingColumn(true)} disabled={columns.length >= 10}>
              <img src="/plus-icon.svg" alt="Plus Icon" height="36" width="36" />
            </button>
          )}
        </div>
      {/* </DndContext> */}

      {showFilters && (
        <div className='modal-overlay'>
          <div className="filter-modal">
            <div className='filter-header'>
              <h3 style={{margin: "0"}}>Filter Issues</h3>
              <h3 onClick={closeFilter} style={{margin: "0"}}>X</h3>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <h4>Priority</h4>
                <div>
                  <label style={{ display: "block", margin: "5px 0" }}>
                    <input 
                      type="checkbox" 
                      checked={filterPriority.includes("high")} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterPriority([...filterPriority, "high"]);
                        } else {
                          setFilterPriority(filterPriority.filter(p => p !== "high"));
                        }
                      }} 
                    /> High
                  </label>
                  <label style={{ display: "block", margin: "5px 0" }}>
                    <input 
                      type="checkbox" 
                      checked={filterPriority.includes("medium")} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterPriority([...filterPriority, "medium"]);
                        } else {
                          setFilterPriority(filterPriority.filter(p => p !== "medium"));
                        }
                      }} 
                    /> Medium
                  </label>
                  <label style={{ display: "block", margin: "5px 0" }}>
                    <input 
                      type="checkbox" 
                      checked={filterPriority.includes("low")} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterPriority([...filterPriority, "low"]);
                        } else {
                          setFilterPriority(filterPriority.filter(p => p !== "low"));
                        }
                      }} 
                    /> Low
                  </label>
                </div>
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
                <button type="button" className="btn btn-primary" onClick={filterpriority}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modals">
            
            <div className="modalContent">
              <div className="modalheader">
                <h2 style={{margin:"0"}}>Select Status</h2>
              </div>

              <div className="form-control" style={{padding:"10px 20px", border:"none"}}>
                <p style={{color:"#A6A4B2", fontSize:"12px", marginBottom:"10px"}}>The column you want to delete contains active issues. Move them to another column.</p>
                <select
                  className="select-input"
                  value={fallbackStatusId}
                  onChange={(e) => setFallbackStatusId(e.target.value)}
                >
                  <option value="">Select Status</option>
                  {statusList.map((status) =>
                      String(status.ID) !== String(deletecolumn) ? (
                          <option key={status.ID} value={status.ID}>
                              {status.Name}
                          </option>
                      ) : null
                  )}
                </select>
              </div>

              <div className="modalfooter">
                <button style={{margin:"0 3px"}} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={{margin:"0 3px"}} onClick={() => confirmDelete(deletecolumn)}>Save</button>
              </div>
            </div>

            

        </div>
      )}

      {ticketModal && <AddTicketModal onclose={handleCloseTicket} statusList={statusList} />}{" "}
      {/* Updated AddTicketModal */}
      {issueDetail && selectedIssue && <IssueDetails issue={selectedIssue} onClose={handleCloseTicket} />}
      {isLoading && <Loading show={isLoading} />}
    </div>
  )
}

export default Board