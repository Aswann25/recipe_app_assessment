import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Register the service worker for offline support and PWA functionality
if ("serviceWorker" in navigator) {
  // Wait until the page has fully loaded before registering
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((r) => console.log("SW registered:", r.scope))
      .catch((e) => console.log("SW failed:", e));
  });
}

// Mount the React app into the #root div
ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode highlights potential issues by double-invoking certain functions in development
  <React.StrictMode>
    <App />
  </React.StrictMode>
);