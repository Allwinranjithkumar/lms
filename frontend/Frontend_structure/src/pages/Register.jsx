import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginHero from "../Components/login_component/LoginHero";
import RoleSelector from "../Components/login_component/RoleSelector";
import SocialLogin from "../Components/login_component/SocialLogin";
import logo from "../assets/3dlogo.png";
import "../styles/login.css";
import { redirectPathForRole, registerUser, saveSession } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    year: "1st Year",
    institution: "",
    experience: "",
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const strength = [
    password.length > 5,
    password.length > 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ].filter(Boolean).length;

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await registerUser({
        ...form,
        password,
        role,
      });
      saveSession(session, true);
      navigate(redirectPathForRole(session.user.role));
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (session) => {
    saveSession(session, true);
    navigate(redirectPathForRole(session.user.role));
  };

  const handleAuthError = (message) => {
    setError(message);
  };

  const handleGoogleProfile = (profile) => {
    // Prefill registration form with Google profile data
    setForm((current) => ({
      ...current,
      name: profile.name || current.name,
      email: profile.email || current.email,
    }));
    setError("");
  };

  return (
    <main className="login-page min-h-screen flex flex-col lg:flex-row">
      <LoginHero />

      <section className="w-full lg:w-[40%] bg-white dark:bg-[#0B0F0D] flex flex-col items-center justify-between p-6 lg:p-12 relative overflow-y-auto">
        <div className="w-full flex justify-end mb-8">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            aria-label="Toggle theme"
          >
            <i className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"} text-[20px] text-gray-700 dark:text-gray-300`}></i>
          </button>
        </div>

        <div className="w-full max-w-[420px] space-y-8 my-auto">
          <div className="flex flex-col items-center">
            <img src={logo} alt="JAWA EDTECH" className="w-[200px] mb-8" />

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-[#0F3D2E] dark:text-white">
                Create Account
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Join JAWA EDTECH and start your learning journey.
              </p>
            </div>
          </div>

          <RoleSelector role={role} setRole={setRole} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block ml-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Alex Johnson"
                className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block ml-1">
                  Email
                </label>
                <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
              />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block ml-1">
                  Mobile
                </label>
                <input
                type="tel"
                required
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
              />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a secure password"
                  className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 pr-12 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((item) => (
                  <span
                    key={item}
                    className={`h-1.5 rounded-full ${
                      item <= strength
                        ? strength <= 1
                          ? "bg-red-500"
                          : strength === 2
                          ? "bg-yellow-500"
                          : "bg-green-500"
                        : "bg-gray-200 dark:bg-white/10"
                    }`}
                  ></span>
                ))}
              </div>
            </div>

            {role === "student" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.college}
                  onChange={(event) => setField("college", event.target.value)}
                  placeholder="College"
                  className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
                />
                <select
                  value={form.year}
                  onChange={(event) => setField("year", event.target.value)}
                  className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.institution}
                  onChange={(event) => setField("institution", event.target.value)}
                  placeholder="Institution"
                  className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
                />
                <input
                  type="number"
                  value={form.experience}
                  onChange={(event) => setField("experience", event.target.value)}
                  placeholder="Experience"
                  className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F3D2E] dark:bg-green-500 text-white dark:text-black font-bold py-4 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex justify-center items-center gap-2 mt-8"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <SocialLogin
            role={role}
            disabled={loading}
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
            onProfile={handleGoogleProfile}
          />
        </div>

        <div className="w-full max-w-[420px] mt-12 pb-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-100/40 to-green-50 dark:from-green-500/20 dark:to-green-900/30 border border-green-200 dark:border-green-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-bold text-[#0F3D2E] dark:text-green-400 text-lg">
                Already registered?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign in and continue where you left off.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 rounded-xl bg-[#0F3D2E] dark:bg-green-500 text-white dark:text-black font-bold text-sm hover:scale-105 transition-all"
            >
              Sign In
            </button>
          </div>

          <p className="text-[11px] text-center mt-8 text-gray-400 dark:text-gray-600 font-medium tracking-wide">
            © 2024 JAWA EDTECH. ALL RIGHTS RESERVED.
          </p>
        </div>
      </section>
    </main>
  );
}
