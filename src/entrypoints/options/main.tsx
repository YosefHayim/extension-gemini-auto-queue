import "@/assets/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";

import Options from "./Options";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
