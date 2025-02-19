import { useState, useEffect } from "react"
import "./Board.css"
import { AddTicketModal } from "../AddTicket/AddTicketModal.js"
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableItem } from "../Search/SortableItem.js"
import { SortableTicket } from "../Templates/SortableTicket.js"
import SearchContainer from "../Search/Search.js"
import { getProject, getIssuesByProjectID, getStatus, addStatus, deleteStatus } from "../../Service.js"
import Select from "react-select"
import IssueDetails from "../IssueDetails/IssueDetails.js"
import Loading from "../Templates/Loading.js"

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
  const [initialStatus, setInitialStatus] = useState("") // Added new state variable
  const [statusList, setStatusList] = useState([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the source and destination columns
    const sourceColumn = columns.find((col) => col.items.some((item) => item.id === activeId))
    const destColumn = columns.find((col) => col.id === overId)

    if (sourceColumn && destColumn) {
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((col) => {
          if (col.id === sourceColumn.id) {
            return {
              ...col,
              items: col.items.filter((item) => item.id !== activeId),
            }
          }
          if (col.id === destColumn.id) {
            return {
              ...col,
              items: [...col.items, sourceColumn.items.find((item) => item.id === activeId)],
            }
          }
          return col
        })
        return newColumns
      })
    } else if (active.id !== over.id) {
      // Handle column reordering
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const getColumns = async () => {
    try {
      const response = await getStatus(`/status`)
      // console.log(response)

      const statuses = response.statuses; // Extract array
      console.log(statuses);
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

  const deleteColumn = async (columnId) => {
    try {
      const response = await deleteStatus(`/status/delete/${columnId}`)

      // Remove the column from state
      setColumns((prev) => prev.filter((col) => col.id !== columnId))
    } catch (error) {
      console.error("Error deleting column:", error)
    }
  }

  const addNewColumn = async () => {
    if (!newColumnTitle.trim()) {
      alert("Column title cannot be empty!")
      return
    }
    if (columns.length >= 10) {
      alert("You can't add more than 10 columns!")
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
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      setProjectList([])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const storedProjectIds = JSON.parse(localStorage.getItem("selectedProjectIds")) || []
    if (storedProjectIds.length > 0) {
      setSelectedProjects(storedProjectIds)
      fetchIssues(storedProjectIds)
    }
    getColumns()
  }, [])

  const fetchIssues = async (projectIds) => {
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

        // ✅ **Fix Priority Sorting**
        const priorityOrder = { high: 1, medium: 2, low: 3 };

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
    // Updated handleAddTicket function
    setTicketModal(true)
    setInitialStatus(columnId)
  }

  const handleCloseTicket = () => {
    setIssueDetail(false)
    setTicketModal(false)
    setSelectedIssue(null)
    fetchIssues()
  }
  const handleTicketDetail = (issue) => {
    setSelectedIssue(issue)
    setIssueDetail(true)
  }

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

  return (
    <div className="board">
      <div className="board-header">
        <h2>Issue Board</h2>
        <button onClick={handleAddTicket}>Create</button>
      </div>
      <SearchContainer />
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
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="board-columns">
          <SortableContext items={columns.map((col) => col.id)} strategy={verticalListSortingStrategy}>
            {columns.map((column) => (
              <SortableItem key={column.id} id={column.id}>
                <div className="column">
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
                      <button onClick={() => deleteColumn(column.id)} className="delete-column">
                        <img src="/delete.svg" style={{ width: "24px", height: "24px" }} alt="delete" />
                      </button>
                    )}
                  </div>

                  <div className="tickets">
                    <SortableContext items={column.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                      {column.items.map((item) => (
                        <SortableTicket key={item.issue_id} id={item.issue_id}>
                          <div className="ticket" onClick={() => handleTicketDetail(item)}>
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
                                  <span>3</span>
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
                                  <span>3</span>
                                </div>
                              </div>
                              <div></div>
                            </div>
                          </div>
                        </SortableTicket>
                      ))}
                    </SortableContext>
                  </div>

                  <button className="create-issue" onClick={() => handleAddTicket(column.id)}>
                    {" "}
                    {/* Updated Create Issue button */}
                    <u>Create Issue</u>
                  </button>
                </div>
              </SortableItem>
            ))}
          </SortableContext>

          {isAddingColumn ? (
            <div className="add">
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="New column title"
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
      </DndContext>
      {ticketModal && <AddTicketModal onclose={handleCloseTicket} statusList={statusList} />}{" "}
      {/* Updated AddTicketModal */}
      {issueDetail && selectedIssue && <IssueDetails issue={selectedIssue} onClose={handleCloseTicket} />}
      {isLoading && <Loading show={isLoading} />}
    </div>
  )
}

export default Board