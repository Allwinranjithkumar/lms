import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RoleSelector from "./RoleSelector";
import SocialLogin from "./SocialLogin";
import NewUserCard from "./NewUserCard";
import { loginUser, redirectPathForRole, saveSession } from "../../services/api";

// Replace with your logo
import logo from "../../assets/3dlogo.png";

export default function LoginForm() {
  const [role, setRole] = useState("student");
  const [darkMode, setDarkMode] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const session = await loginUser({
        email: formData.email,
        password: formData.password,
        role,
      });
      saveSession(session, formData.remember);
      navigate(redirectPathForRole(session.user.role));
    } catch (err) {
      setError(err.message || "Login failed.");
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

  return (
    <section className="w-full lg:w-[40%] bg-white dark:bg-[#0B0F0D] flex flex-col items-center justify-between p-6 lg:p-12 relative overflow-y-auto">

      {/* Theme Toggle */}
      <div className="w-full flex justify-end mb-8">

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
        >
          <i className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"} text-[20px] text-gray-700 dark:text-gray-300`}></i>
        </button>

      </div>

      {/* Main Content */}
      <div className="w-full max-w-[420px] space-y-10 my-auto">

        {/* Logo */}
        <div className="flex flex-col items-center">

          <img
            src={logo}
            alt="JAWA EDTECH"
            className="w-[200px] mb-8"
          />

          <div className="text-center space-y-2">

            <h2 className="text-3xl font-bold text-[#0F3D2E] dark:text-white">
              Welcome Back
            </h2>

            <p className="text-gray-500 dark:text-gray-400">
              Sign in to continue your learning journey.
            </p>

          </div>
        </div>

        {/* Role Selector */}
        <RoleSelector
          role={role}
          setRole={setRole}
        />

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}
          <div className="space-y-2">

            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block ml-1">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
            />

          </div>

          {/* Password */}
          <div className="space-y-2">

            <div className="flex justify-between items-center px-1">

              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Password
              </label>

              <a
                href="#"
                className="text-xs font-semibold text-[#0F3D2E] dark:text-green-500"
              >
                Forgot password?
              </a>

            </div>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 py-3.5 px-4 pr-12 focus:outline-none focus:border-[#0F3D2E] dark:focus:border-green-500 text-black dark:text-white"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>

            </div>

          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3 px-1">

            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="w-5 h-5"
            />

            <label className="text-sm text-gray-600 dark:text-gray-400">
              Keep me signed in
            </label>

          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F3D2E] dark:bg-green-500 text-white dark:text-black font-bold py-4 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex justify-center items-center gap-2 mt-8"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>

        </form>

        {/* Social Login */}
        <SocialLogin
          role={role}
          disabled={loading}
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
        />

      </div>

      {/* Footer Card */}
      <div className="w-full max-w-[420px]">
        <NewUserCard />
      </div>

    </section>
  );
}
