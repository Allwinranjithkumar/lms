import { useNavigate } from "react-router-dom";
export default function NewUserCard() {
  const navigate = useNavigate();
  return (
    <div className="w-full mt-12 pb-4">

      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-100/40 to-green-50 dark:from-green-500/20 dark:to-green-900/30 border border-green-200 dark:border-green-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="text-center sm:text-left">
          <p className="font-bold text-[#0F3D2E] dark:text-green-400 text-lg">
            New here?
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Join our global community today.
          </p>
        </div>

        <button 
        onClick={() => navigate("/register")}
        className="px-6 py-2.5 rounded-xl bg-[#0F3D2E] dark:bg-green-500 text-white dark:text-black font-bold text-sm hover:scale-105 transition-all">
          Create Account
        </button>

      </div>

      <p className="text-[11px] text-center mt-8 text-gray-400 dark:text-gray-600 font-medium tracking-wide">
        © 2024 JAWA EDTECH. ALL RIGHTS RESERVED.
      </p>

    </div>
  );
}