import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../Components/students_components/Navbar";

import "../styles/student_dash.css";

export default function StudentLayout() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`sd${isDark ? " sd-dark" : ""}`}>
      <div className="sd-layout">
        <main className="sd-main sd-main-full">
          <Navbar toggleDark={() => setIsDark(!isDark)} isDark={isDark} />
          <div className="sd-content">
            <Outlet context={{ isDark, toggleDark: () => setIsDark(!isDark) }} />
          </div>
        </main>
      </div>
    </div>
  );
}
