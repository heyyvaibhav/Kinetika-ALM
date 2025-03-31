import React from "react";
import { LuChevronRight, LuChevronLeft } from "react-icons/lu";
import "./Templates.css";

const Pagination = ({
  setCurrentPage,
  currentPage,
  shouldShowEllipses,
  duplicateArray,
  itemsPerPage,
  visiblePages,
}) => {
  const totalItems = duplicateArray.length || 0;
  const startItem = duplicateArray.length == 0 ?  0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className="pagination_container"
      style={{ 
        backgroundColor: "white",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "baseline",
        textAlign: "center",
        padding: "0.5rem",
        marginBottom: "1em",
        overflow : "hidden"
      }}
    >
      {/* Pagination Buttons */}
      <div
        className="pagination_box"
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: "auto",
          marginRight: "auto",
          gap: "0.5rem",
        }}
        >
        <div
          onClick={() => {
            if (currentPage !== 1) {
              setCurrentPage(currentPage - 1);
            }
          }}
          disabled={currentPage === 1} // Disable if on first page
          style={{ cursor: currentPage === 1 ? "not-allowed" : "pointer", border : "1px solid #ddd", borderRadius : "8px", width : "30px", height : "30px" ,  alignItems: "center", justifyContent : "center",}}
        >
            <LuChevronLeft style={{width : "24px", height : "24px", marginTop :"2px"}} />
        </div>
        {visiblePages.map((page) => (
          <div
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              backgroundColor: page === currentPage ? "#FDBB05" : "white",
              color: page === currentPage ? "white" : "black", // Change color to yellow for current page
              width: "30px",
              height: "30px",
              borderRadius : "8px",
              display: "flex",
              alignItems: "center",
              justifyContent : "center",
              marginLeft: "auto",
              marginRight: "auto",
              gap: "0.5rem",
              border : "1px solid #ddd"
            }}
          >
            {page}
          </div>
        ))}
        {shouldShowEllipses() && (
          <div style={{
            width: "30px",
            height: "30px",
            borderRadius : "8px",
            display: "flex",
            alignItems: "center",
            justifyContent : "center",
            marginLeft: "auto",
            marginRight: "auto",
            gap: "0.5rem",
            border : "1px solid #ddd"
          }}>
            <img src="/three_dots.svg" alt="more" />
          </div>
        )}
        <div
          onClick={() => {
            const lastPage = Math.ceil(duplicateArray.length / itemsPerPage);
            if (currentPage < lastPage) {
              setCurrentPage(currentPage + 1);
            }
          }}
          disabled={
            currentPage === Math.ceil(duplicateArray.length / itemsPerPage)
          }
          style={{ cursor:
              currentPage === Math.ceil(duplicateArray.length / itemsPerPage)
                ? "not-allowed"
                : "pointer", border : "1px solid #ddd", borderRadius : "8px", width : "30px", height : "30px" ,  alignItems: "center", justifyContent : "center",}}
        >
            <LuChevronRight style={{width : "24px", height : "24px", marginTop :"2px"}} />
        </div>
      </div>

      {/* Results Count */}
      <div className="paginationMobile" style={{ color: "#94A3B8" }}>
        <p>
          {startItem}-{endItem} of {totalItems} results
        </p>
      </div>
    </div>
  );
};

export default Pagination;
