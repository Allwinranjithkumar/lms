import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../Components/teachers_components/Navbar";

import "../styles/teachers_dash.css";

function TeacherLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.style.setProperty("--bg", "#0B1120");
      document.documentElement.style.setProperty("--surface", "#111827");
      document.documentElement.style.setProperty("--surface2", "#1E293B");
      document.documentElement.style.setProperty("--border", "#1F2D3D");
      document.documentElement.style.setProperty("--dark", "#F1F5F9");
    } else {
      document.documentElement.style.setProperty("--bg", "#F0FDF4");
      document.documentElement.style.setProperty("--surface", "#FFFFFF");
      document.documentElement.style.setProperty("--surface2", "#F8FAFC");
      document.documentElement.style.setProperty("--border", "#E5E7EB");
      document.documentElement.style.setProperty("--dark", "#0F172A");
    }
  }, [isDarkMode]);

  return (
    <div className={`teacher-dashboard${isDarkMode ? " teacher-dark" : ""}`}>
      <div className="layout">
        <main className="main main-full">
          <Navbar
            toggleDark={() => setIsDarkMode(!isDarkMode)}
            isDarkMode={isDarkMode}
          />

          <div className="content">
            <Outlet context={{ isDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode) }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default TeacherLayout;
