import React, { useState } from "react"
import "./Board.css"
import AddTicket from "../AddTicket/AddTicket.js"
import { AddTicketModal } from "../AddTicket/AddTicketModal.js"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableItem } from "../Search/SortableItem.js"
import SearchContainer from "../Search/Search.js"

function Board() {
  const [columns, setColumns] = useState([
    { id: "todo", title: "TO DO", items: [] },
    { id: "inProgress", title: "IN PROGRESS", items: [] },
    { id: "done", title: "DONE", items: [] },
  ])

  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [ticketModal, setTicketModal] = useState(false)
  const [isAddingColumn, setIsAddingColumn] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const deleteColumn = (columnId) => {
    setColumns(columns.filter((col) => col.id !== columnId))
  }

  const addNewColumn = () => {
    if (!newColumnTitle.trim()) {
      alert("Column title cannot be empty!")
      return
    }
    if (columns.length >= 10) {
      alert("You can't add more than 10 columns!")
      return
    }
    setColumns((prev) => [
      ...prev,
      {
        id: newColumnTitle.toLowerCase().replace(/\s+/g, "-"),
        title: newColumnTitle,
        items: [],
      },
    ])
    setNewColumnTitle("")
    setIsAddingColumn(false)
  }

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
    setTicketModal(true)
  }
  const handleCloseTicket = () => {
    setTicketModal(false)
  }

  return (
    <div className="board">
      <div className="board-header">
        <h2>Project Board</h2>
        <button onClick={handleAddTicket}>Create</button>
      </div>

      <SearchContainer />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="board-columns">
          <SortableContext items={columns.map((col) => col.id)} strategy={verticalListSortingStrategy}>
            {columns.map((column) => (
              <SortableItem key={column.id} id={column.id}>
                <div className="column">
                  <div className="column-header">
                    <div style={{ display: "flex" }}>
                      <img src="./plus-icon.svg" alt="Plus Icon" height="24" width="24" />
                      <h3 style={{ margin: "0" }}>{column.title}</h3>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor:
                          column.id === "todo"
                            ? "#FFEDEC"
                            : column.id === "inProgress"
                              ? "#E9EEFF"
                              : column.id === "done"
                                ? "#E9FAF2"
                                : "#FFF7E9",
                        borderRadius: "10px",
                        border:
                          column.id === "todo"
                            ? "1px solid #E36A7A"
                            : column.id === "inProgress"
                              ? "1px solid #6976C9"
                              : column.id === "done"
                                ? "1px solid #5DCE9F"
                                : "1px solid #E4B54F",
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
                                : "./fire.svg"
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
                            column.id === "todo"
                              ? "#E36A7A"
                              : column.id === "inProgress"
                                ? "#6976C9"
                                : column.id === "done"
                                  ? "#5DCE9F"
                                  : "#E4B54F",
                        }}
                      >
                        {column.items.length}
                      </span>
                    </div>
                    {column.id !== "todo" && column.id !== "inProgress" && column.id !== "done" && (
                      <button onClick={() => deleteColumn(column.id)} className="delete-column">
                        X
                      </button>
                    )}
                  </div>

                  <div className="tickets">
                    {column.items.map((item) => (
                      <div key={item.id} className="ticket">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    ))}
                  </div>
                  <AddTicket onAddTicket={(newTicket) => addNewTicket(column.id, newTicket)} />
                  <button className="create-issue" onClick={handleAddTicket}>
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
                <button onClick={addNewColumn}>Add Column</button>
                <button onClick={() => setIsAddingColumn(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="addColumnbtn" onClick={() => setIsAddingColumn(true)} disabled={columns.length >= 10}>
              <img src="./plus-icon.svg" alt="Plus Icon" height="36" width="36" />
            </button>
          )}
        </div>
      </DndContext>

      {ticketModal && <AddTicketModal onclose={handleCloseTicket} />}
    </div>
  )
}

export default Board

