import React, { useState } from "react"
import "./SearchContainer.css"

const SearchContainer = ({ searchTerm, setSearchTerm, setSortOrder, handleFilter }) => {
  
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
                style={{padding: "8px",
                    paddingLeft: "32px",
                    paddingRight: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    width: "60%",                    
                    height: "36px",
                    justifyItems: "absolute",}}
              />
            </div>
            <div style={{borderRight: "1px solid #ddd", marginRight:"1em"}}>
                <div className="mt-2 control-buttons">
                <button
                    className="control-btn"
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                >
                    <span className="btn-text">
                    <img src="/sort.svg" style={{ width:"24px", height:"24px" }} alt="sorticon" />
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
                        style={{  width:"24px", height:"24px" }}
                        alt="filtericon"
                    />
                    Filter
                    </span>
                </button>
                </div>
            </div>
            <div className="user-profile-images">
                <img src="/kinetikalogo.png" className="profile-img" alt="User 1" />
                <img src="/image-modified.png" className="profile-img" alt="User 2" />
                {/* <img src="/user3.jpg" className="profile-img" alt="User 3" /> */}
            </div>
        </div>
  )
}

export default SearchContainer

