import React, { useState } from "react"
import "./Board.css"
import AddTicket from "../AddTicket/AddTicket.js"
import { AddTicketModal } from "../AddTicket/AddTicketModal.js"

function Board() {
  const [columns, setColumns] = useState([
    { id: "todo", title: "TO DO", items: [] },
    { id: "inProgress", title: "IN PROGRESS", items: [] },
    { id: "done", title: "DONE", items: [] },
  ])

  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [ticketModal, setTicketModal] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleDragStart = (e, itemId, sourceColumn) => {
    e.dataTransfer.setData("itemId", itemId)
    e.dataTransfer.setData("sourceColumn", sourceColumn)
  }

  const handleDrop = (e, targetColumn) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData("itemId")
    const sourceColumn = e.dataTransfer.getData("sourceColumn")

    if (sourceColumn === targetColumn) return

    setColumns((prevColumns) => {
      const newColumns = [...prevColumns]
      const sourceCol = newColumns.find((col) => col.id === sourceColumn)
      const targetCol = newColumns.find((col) => col.id === targetColumn)
      const item = sourceCol.items.find((item) => item.id === itemId)

      if (item) {
        sourceCol.items = sourceCol.items.filter((i) => i.id !== itemId)
        targetCol.items.push(item)
      }

      return newColumns
    })
  }

  const addNewColumn = () => {
    if (!newColumnTitle.trim()) {
      alert("Column title cannot be empty!"); // Alert for empty input
      return;
    }
  
    setColumns((prev) => [
      ...prev,
      {
        id: newColumnTitle.toLowerCase().replace(/\s+/g, "-"),
        title: newColumnTitle,
        items: [],
      },
    ]);
  
    alert(`Column "${newColumnTitle}" added successfully!`); // Success alert
    setNewColumnTitle(""); // Clear the input field
    setIsAddingColumn(false); // Close the input field
  };

  const addNewTicket = (columnId, newTicket) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            items: [...col.items, newTicket],
          }
        }
        return col
      }),
    )
  }

  const handleAddTicket = () => {
    setTicketModal(true);
  }
  const handleCloseTicket = () => {
    setTicketModal(false);
  }

  return (
    <div className="board">
      <div className="board-header">
        <h2>Project Board</h2>
        <button onClick={handleAddTicket}>Create</button>
      </div>

      <div className="board-columns">
        {columns.map((column) => (
          <div
            key={column.id}
            className="column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-header">
              <div style={{ display: "flex"}}>
                <img src="./plus-icon.svg" alt="Plus Icon" height="24" width="24" />
                <h3 style={{margin:"0"}}>{column.title}</h3>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor:
                    column.id === "todo"
                      ? "#FFEDEC" // Light beige for "todo"
                      : column.id === "inProgress"
                      ? "#E9EEFF" // Lavender for "in-progress"
                      : column.id === "done"
                      ? "#E9FAF2" // Light green for "done"
                      : "#FEF8E6", // Default light gray
                  borderRadius: "10px",
                  padding: "4px 8px",
                }}
              >
                <img
                  src={
                    column.id === "todo"
                      ? "./todo.svg"
                      : column.id === "inProgress"
                      ? "./inProgress.svg"
                      : column.id === "done"
                      ? "./done.svg"
                      : "./default-icon.svg" // Fallback icon
                  }
                  alt={`${column.id} Icon`}
                  height="20"
                  width="20"
                />
                <span style={{ marginLeft: "8px", fontWeight: "bold" }}>
                  10 {/* Number of tickets */}
                </span>
              </div>

            </div>

            <div className="tickets">
              {column.items.map((item) => (
                <div
                  key={item.id}
                  className="ticket"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id, column.id)}
                >
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <AddTicket onAddTicket={(newTicket) => addNewTicket(column.id, newTicket)} />

            <button className="create-issue" onClick={handleAddTicket}><u>Create Issue</u></button>
          </div>
        ))}

      {isAddingColumn ? (
        <div className="add">
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="New column title"
          />
          <div style={{display:"flex", gap:"8px", justifyContent:"flex-end"}}>
            <button onClick={addNewColumn}>Add Column</button>
            <button onClick={() => setIsAddingColumn(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          className="addColumnbtn"
          onClick={() => setIsAddingColumn(true)}
        >
          <img src="./plus-icon.svg" alt="Plus Icon" height="36" width="36" />
        </button>
      )}        
      </div>

      {ticketModal && (
        <AddTicketModal onclose = {handleCloseTicket}/>
      )}
    </div>

    
  )
}



export default Board

