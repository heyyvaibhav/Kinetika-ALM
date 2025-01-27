import React, { useState } from 'react';
import './List.css';

function List() {
  const [tickets, setTickets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newTicket, setNewTicket] = useState({
    type: '',
    key: '',
    summary: '',
    status: '',
    assignee: '',
    dueDate: ''
  });

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = (id) => {
    setEditingId(null);
  };

  const handleChange = (id, field, value) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === id) {
        return { ...ticket, [field]: value };
      }
      return ticket;
    }));
  };

  const addNewTicket = () => {
    if (!newTicket.summary.trim()) return;
    setTickets(prev => [...prev, {
      id: Date.now().toString(),
      ...newTicket
    }]);
    setNewTicket({
      type: '',
      key: '',
      summary: '',
      status: '',
      assignee: '',
      dueDate: ''
    });
  };

  return (
    <div className="list">
      <div className="list-header">
        <h2>Project List</h2>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Key</th>
            <th>Summary</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>
                {editingId === ticket.id ? (
                  <input
                    value={ticket.type}
                    onChange={(e) => handleChange(ticket.id, 'type', e.target.value)}
                  />
                ) : ticket.type}
              </td>
              <td>{ticket.key}</td>
              <td>
                {editingId === ticket.id ? (
                  <input
                    value={ticket.summary}
                    onChange={(e) => handleChange(ticket.id, 'summary', e.target.value)}
                  />
                ) : ticket.summary}
              </td>
              <td>
                {editingId === ticket.id ? (
                  <input
                    value={ticket.status}
                    onChange={(e) => handleChange(ticket.id, 'status', e.target.value)}
                  />
                ) : ticket.status}
              </td>
              <td>
                {editingId === ticket.id ? (
                  <input
                    value={ticket.assignee}
                    onChange={(e) => handleChange(ticket.id, 'assignee', e.target.value)}
                  />
                ) : ticket.assignee}
              </td>
              <td>
                {editingId === ticket.id ? (
                  <input
                    type="date"
                    value={ticket.dueDate}
                    onChange={(e) => handleChange(ticket.id, 'dueDate', e.target.value)}
                  />
                ) : ticket.dueDate}
              </td>
              <td>
                {editingId === ticket.id ? (
                  <button onClick={() => handleSave(ticket.id)}>Save</button>
                ) : (
                  <button onClick={() => handleEdit(ticket.id)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      
    </div>
  );
}

export default List;