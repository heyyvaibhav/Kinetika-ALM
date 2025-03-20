import React from "react";

const Loading = ({ show }) => {
  if (!show) return null; // Don't render anything if show is false

  return (
    <div
      style={{
        position: "fixed", // Fix to cover the entire screen
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.2)", // White with opacity
        // backdropFilter: "blur(2px)", // Apply blur effect to the background
        display: "flex", // Center the spinner
        justifyContent: "center",
        alignItems: "center",
        zIndex: 6000, // Ensure the spinner is on top
      }}
    >
    <div className="loader">
      <style jsx>{`
        .loader {
          width: 50px;
          aspect-ratio: 1;
          border-radius: 50%;
          background: 
            radial-gradient(farthest-side,rgb(111, 170, 234) 94%, #0000) top/8px 8px no-repeat,
            conic-gradient(#0000 30%, rgb(111, 170, 234));
          -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 8px), #000 0);
          animation: l13 1s infinite linear;
        }
        
        @keyframes l13 { 
          100% { transform: rotate(1turn); }
        }          
      `}</style>
    </div>
    </div>
  );

  
};

export default Loading;
