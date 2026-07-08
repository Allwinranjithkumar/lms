export default function RoleSelector({ role, setRole }) {
  return (
    <div className="relative p-1 rounded-xl bg-gray-100 dark:bg-white/5 flex">

      {/* Sliding Indicator */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-[#0F3D2E] dark:bg-green-500 transition-all duration-300 ${
          role === "student"
            ? "left-1"
            : "left-[calc(50%+4px)]"
        }`}
      ></div>

      {/* Student Button */}
      <button
        onClick={() => setRole("student")}
        className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors duration-300 ${
          role === "student"
            ? "text-white dark:text-black"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        Student
      </button>

      {/* Teacher Button */}
      <button
        onClick={() => setRole("teacher")}
        className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors duration-300 ${
          role === "teacher"
            ? "text-white dark:text-black"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        Teacher
      </button>

    </div>
  );
}