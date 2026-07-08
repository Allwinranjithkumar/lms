import { useNavigate } from "react-router-dom";
import { useState } from "react";

function CTA() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-green-800 p-12 md:p-20 text-center shadow-2xl">

            {/* Decorative Background Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Learning?
              </h2>

              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
                Join thousands of educators and students who are
                already shaping the future of education with
                Jawa Edtech.
              </p>

              <div className="flex flex-wrap justify-center gap-6">

                <button
                  onClick={() => navigate("/login")}
                  className="bg-white text-green-700 px-10 py-4 rounded-xl font-semibold hover:scale-105 transition"
                >
                  Get Started Now
                </button>

                <button
                  onClick={() => setShowVideo(true)}
                  className="border border-white/40 text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/10 transition"
                >
                  Demo
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white text-3xl font-bold hover:text-gray-300"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* YouTube Video */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-2xl">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/ezbJwaLmOeM?autoplay=1"
                title="Jawa Edtech Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CTA;
