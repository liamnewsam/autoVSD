import React from "react";
import "../style/LoadingOverlay.css"; // Import the CSS for styling

const LoadingOverlay = () => {
  return (
    <div className="overlay">
      <div className="loader"></div>
    </div>
  );
};

export default LoadingOverlay;
