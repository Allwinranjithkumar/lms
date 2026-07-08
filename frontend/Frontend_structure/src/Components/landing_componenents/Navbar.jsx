import { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);
  const navigate = useNavigate();
  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }

    setDarkMode(!darkMode);
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Jawa Edtech"
            className="w-10 h-10 rounded-lg"
          />

          <span className="font-bold text-green-700 text-lg leading-5">
            JAWA EDTECH
          </span>
        </div>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-600 hover:text-green-600 transition"
          >
            Features
          </a>

          <a
            href="#Preview"
            className="text-gray-600 hover:text-green-600 transition"
          >
            Preview
          </a>

          <a
            href="#contact"
            className="text-gray-600 hover:text-green-600 transition"
          >
            Contact
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Dark Mode Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <i className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
          </button>

         <a
  href="/login"
  className="text-gray-600 hover:text-green-600"
>
  Login
</a>
          <button 
          onClick={() => navigate("/login")}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition">
            Get Started
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
