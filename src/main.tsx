import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

if (window.location.pathname.replace(/\/+$/, "") === "/compare") {
  Promise.all([import("./compare/CompareView"), import("./compare/compare.css")]).then(([{ default: CompareView }]) => {
    document.title = "视觉对比 · 微信 iOS 界面模拟器";
    root.render(<React.StrictMode><CompareView /></React.StrictMode>);
  });
} else {
  import("./ChatStudio").then(({ default: ChatStudio }) => {
    root.render(<React.StrictMode><ChatStudio /></React.StrictMode>);
  });
}
