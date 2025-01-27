import React, { useState } from "react"
import "./AddTicket.css"

function AddTicket({ onAddTicket }) {
  const [newTicket, setNewTicket] = useState({ title: "", description: "" })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newTicket.title.trim()) return
    onAddTicket({
      id: Date.now().toString(),
      title: newTicket.title,
      description: newTicket.description,
    })
    setNewTicket({ title: "", description: "" })
  }

  return (
    <form className="add-ticket-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ticket title"
        value={newTicket.title}
        onChange={(e) => setNewTicket((prev) => ({ ...prev, title: e.target.value }))}
        required
      />
      <textarea
        placeholder="Description"
        value={newTicket.description}
        onChange={(e) => setNewTicket((prev) => ({ ...prev, description: e.target.value }))}
      />
      <button type="submit">Add Ticket</button>
    </form>
  )
}

export default AddTicket

