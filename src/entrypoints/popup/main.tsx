import "@/assets/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";

import Popup from "./Popup";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
