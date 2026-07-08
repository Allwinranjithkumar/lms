import { useNavigate } from "react-router-dom";
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative pt-32 pb-20 overflow-hidden hero-gradient">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left Content */}
        <div className="space-y-8">

          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Powered by Advanced AI
          </div>

          {/* Heading */}
          <div className="space-y-4">

            <h1 className="text-5xl font-bold leading-tight">
              Learn Smarter <br />
              <span className="text-green-600">
                with AI
              </span>
            </h1>

            <p className="text-2xl text-gray-700">
              AI-Powered Learning Management System
            </p>

            <p className="text-lg text-gray-600 max-w-lg">
              Empower your educational journey with personalized
              AI paths, smart grading, and intuitive course
              management designed for the future of learning.
            </p>

          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">

            <button 
            onClick={() => navigate("/login")}
            className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition">
              Start Learning
            </button>

            <button 
            onClick={() => navigate("/login")}
            className="border border-green-600 text-green-600 px-8 py-4 rounded-xl hover:bg-green-50 transition">
              Login
            </button>

          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t">

            <div>
              <div className="text-2xl font-bold text-green-600">
                1000+
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500">
                Students
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-green-600">
                100+
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500">
                Courses
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-green-600">
                50+
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500">
                Instructors
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-green-600">
                AI
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500">
                Powered
              </div>
            </div>

          </div>

        </div>

        {/* Right Side Image */}
        <div className="relative">

          <div className="glass-card rounded-3xl p-4 overflow-hidden shadow-2xl">

            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtUwwiEIGFtc0k2xXFzQgfneU-1j-FQuD3oczNZmP9gjS4zp7Uk4rHHgQqmffbPIXLc9p_h0iv9eGrsnJPsa4NPOqCt9wFcWYjY4zyrAfwVY1fGnCPBf4__6g_UPXPy0tOr4klKE5hDS3l5wqJnyMVYeDEY9goP476AJLQyUZWi3RrpXz---YLcyb0yvhUf5y_5l13AUyZPWM_CWhk7tDpUNdXnvPxIoqdy-ZmToee1p_TZAEuaNkS9ECprFF6DBGl6sbiNB1xepI"
              alt="Dashboard"
              className="w-full rounded-2xl"
            />

          </div>

          {/* Floating Progress Card */}
          <div
            className="absolute -top-6 -right-6 glass-card p-4 rounded-2xl shadow-xl animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                <i className="fa-solid fa-chart-line"></i>
              </div>

              <div>
                <div className="font-semibold">
                  +24%
                </div>

                <div className="text-xs text-gray-500">
                  Weekly Progress
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;
