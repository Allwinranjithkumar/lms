import ParticlesCanvas from "./ParticlesCanvas";

const heroSlides = [
  {
    src: "https://images.pexels.com/photos/5212655/pexels-photo-5212655.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Teacher running an online class from a laptop",
  },
  {
    src: "https://images.pexels.com/photos/5212666/pexels-photo-5212666.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Student joining a virtual classroom lesson",
  },
  {
    src: "https://images.pexels.com/photos/5212657/pexels-photo-5212657.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Remote learning session in a modern classroom",
  },
  {
    src: "https://images.pexels.com/photos/4144530/pexels-photo-4144530.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Student learning through a live video lesson",
  },
];

export default function LoginHero() {
  return (
    <section className="relative w-full lg:w-[60%] min-h-[500px] lg:min-h-screen bg-[#0F3D2E] flex flex-col justify-center items-center p-6 lg:p-16 overflow-hidden">

      <ParticlesCanvas />

      <div className="relative z-10 max-w-[640px] text-center lg:text-left space-y-10">

        <div className="space-y-6">
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            Welcome to the Future of Learning
          </h1>

          <p className="text-white/70 text-lg lg:text-xl">
            AI-powered education platform designed for students,
            teachers, and innovators worldwide.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-left">

          <li className="flex items-center gap-4 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <span>AI Learning Assistant</span>
          </li>

          <li className="flex items-center gap-4 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fa-solid fa-brain"></i>
            </div>
            <span>Smart Recommendations</span>
          </li>

          <li className="flex items-center gap-4 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fa-solid fa-video"></i>
            </div>
            <span>Interactive Live Classes</span>
          </li>

          <li className="flex items-center gap-4 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fa-solid fa-chart-simple"></i>
            </div>
            <span>Real-Time Assessments</span>
          </li>

        </ul>

        <div className="mt-12">
          <div className="glass-card login-hero-slider p-2 rounded-2xl overflow-hidden">
            <div className="login-hero-track">
              {heroSlides.map((slide) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  className="login-hero-slide rounded-xl"
                />
              ))}
            </div>
            <div className="login-hero-dots" aria-hidden="true">
              {heroSlides.map((slide) => (
                <span key={slide.src}></span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


