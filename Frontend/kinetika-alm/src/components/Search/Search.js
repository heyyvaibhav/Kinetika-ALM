import React, { useState, useEffect } from "react"
import "./SearchContainer.css"

const SearchContainer = ({ searchTerm, setSearchTerm, setSortOrder, handleFilter, view, assignees ,selectedAssignees, onAssigneeClick, setSelectedAssignees }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = () => setShowDropdown(!showDropdown);
    const [max, setMax] = useState(window.innerWidth < 400 ? 1 : 3);

    useEffect(() => {
        const handleResize = () => {
            setMax(window.innerWidth < 400 ? 1 : 3);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".dropdown") && !event.target.closest(".more-avatar")) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    
  return (
        <div className="controls">
            <div className="search-container" style={{ width: '100%' }}>
              <img src="/search.svg" className="search_icon" alt="searchicon" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{
                    padding: "8px",
                    paddingLeft: "32px",
                    paddingRight: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    width: "60%",                    
                    height: "36px",
                    justifyItems: "absolute",
                }}
              />
            </div>
            
            {(view === "board" && assignees.length > 0) ? (
                <>
                <div style={{ borderRight: "1px solid #ddd", marginRight: "1em" }}>
                  <div className="control-buttons" style={{marginRight:"1em"}}>
                      <button
                          className="control-btn"
                          onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                      >
                          <span className="btn-text">
                              <img src="/sort.svg" style={{ width: "24px", height: "24px" }} alt="sorticon" />
                              Sort
                          </span>
                      </button>
                      <button
                          className="control-btn"
                          onClick={handleFilter}
                      >
                          <span className="btn-text">
                              <img
                                  src="/filter.svg"
                                  style={{ width: "24px", height: "24px" }}
                                  alt="filtericon" />
                              Filter
                          </span>
                      </button>
                  </div>
                </div>

                <div className="user-profile-container">
                    {assignees.length === 0 ? (
                    <div className="no-assignees">No Assignees</div>
                    ) : (
                        <>
                        {assignees.slice(0, max).map(({ assignee_id, assignee_name }, index) => (
                            <div 
                                key={assignee_id} 
                                className="avatarr" 
                                style={{ zIndex: assignees.length - index, height: "34px", width: "34px" }}
                                title={assignee_name}
                                onClick={() => onAssigneeClick(assignee_id)}
                            > 
                                {assignee_name && typeof assignee_name === "string"
                                  ? assignee_name
                                      .split(" ")
                                      .map(word => word.charAt(0).toUpperCase()) // Extracts and capitalizes initials
                                      .join("")
                                  : ""}
                            </div>
                        ))}

                        {assignees.length > max && (
                            <div className="avatarr more-avatar" onClick={toggleDropdown} style={{width: "30px", height: "30px"}}>
                                +{assignees.length - max}
                            </div>
                        )}

                        {showDropdown && (
                            <div className="dropdown">
                                {assignees.map(({ assignee_id, assignee_name }) => (
                                    <label key={assignee_id} className="dropdown-item">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedAssignees.includes(assignee_id)}
                                            onChange={() => onAssigneeClick(assignee_id)} 
                                        />
                                        {assignee_name}
                                    </label>
                                ))}

                                <button 
                                    className="reset-button" 
                                    onClick={() => {
                                        setSelectedAssignees([]);  // ✅ Clear selected assignees
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        )}
                        </>
                    )}
                </div>
                </>
            ) : (
                <div className="control-buttons">
                      <button
                          className="control-btn"
                          onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                      >
                          <span className="btn-text">
                              <img src="/sort.svg" style={{ width: "24px", height: "24px" }} alt="sorticon" />
                              Sort
                          </span>
                      </button>
                      <button
                          className="control-btn"
                          onClick={handleFilter}
                      >
                          <span className="btn-text">
                              <img
                                  src="/filter.svg"
                                  style={{ width: "24px", height: "24px" }}
                                  alt="filtericon" />
                              Filter
                          </span>
                      </button>
                  </div>
            )}
        </div>
  )
}

export default SearchContainer

