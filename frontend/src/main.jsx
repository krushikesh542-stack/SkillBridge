import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";

import "./index.css";
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/dashboard.css";
import "./styles/sidebar.css";
import "./styles/navbar.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "14px",
            background: "#1f2937",
            color: "#fff",
            padding: "14px 18px",
            fontWeight: 600,
          },
        }}
      />

      <App />
    </BrowserRouter>
  </StrictMode>
);