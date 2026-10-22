import React from "react";
import ReactDOM from "react-dom/client";
import CompareView from "./CompareView";
import "../styles/main.css";
import "./compare.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><CompareView /></React.StrictMode>,
);
