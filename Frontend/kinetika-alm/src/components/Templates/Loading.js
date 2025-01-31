import React from "react";

// Loading component to show the loading spinner and blurred overlay
const Loading = ({ show }) => {
//   if (!show) return null; // Don't render anything if show is false

  return (
    <div
      style={{
        position: "fixed", // Fix to cover the entire screen
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.1)", // White with opacity
        backdropFilter: "blur(2px)", // Apply blur effect to the background
        display: "flex", // Center the spinner
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3000, // Ensure the spinner is on top
      }}
    >
    <div className="loader">
      <style jsx>{`
        .loader {
          --s: 20px;
          --_d: calc(0.353 * var(--s));
          width: calc(var(--s) + var(--_d));
          aspect-ratio: 1;
          display: grid;
          justify-items: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f3f4f6; /* Light grey background */
        }

        .loader:before,
        .loader:after {
          content: "";
          grid-area: 1/1;
          clip-path: polygon(
            var(--_d) 0,
            100% 0,
            100% calc(100% - var(--_d)),
            calc(100% - var(--_d)) 100%,
            0 100%,
            0 var(--_d)
          );
          animation: l6 2s infinite;
        }

        .loader:after {
          animation-delay: -1s;
        }

        @keyframes l6 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
    </div>
  );

  
};

export default Loading;
