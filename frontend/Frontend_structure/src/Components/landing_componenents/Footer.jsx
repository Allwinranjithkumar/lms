import logo from "../../assets/logo.png";

function Footer() {
  return (
    <footer
      id="contact"
      className="bg-slate-900 text-white pt-16 pb-10"
    >
      <div className="max-w-7xl mx-auto px-8">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Company Info */}
          <div>

            <div className="flex items-center gap-3 mb-5">
              <img
                src={logo}
                alt="Jawa Edtech"
                className="w-12 h-12 rounded-lg"
              />

              <h3 className="text-2xl font-bold">
                Jawa Edtech
              </h3>
            </div>

            <p className="text-gray-400 leading-relaxed">
              Revolutionizing education through intelligent
              technology and accessible design for the next
              generation of learners.
            </p>

          </div>

          {/* Contact */}
          <div>

            <h4 className="text-green-400 font-semibold uppercase tracking-wider mb-5">
              Contact Us
            </h4>

            <div className="space-y-4">

              <a
                href="tel:+919790631286"
                className="block text-gray-300 hover:text-white transition"
              >
                <i className="fa-solid fa-phone"></i> +91 9790631286
              </a>

              <a
                href="mailto:hr@jawaedtech.com"
                className="block text-gray-300 hover:text-white transition"
              >
                <i className="fa-regular fa-envelope"></i> hr@jawaedtech.com
              </a>

            </div>

          </div>

          {/* Address */}
          <div>

            <h4 className="text-green-400 font-semibold uppercase tracking-wider mb-5">
              Address
            </h4>

            <p className="text-gray-300 leading-relaxed">
              Jawa Incubation Centre
              <br />
              No: 54 Bharathi Park 7th Cross
              <br />
              Near ICICI Bank
              <br />
              Saibaba Colony
              <br />
              Coimbatore
              <br />
              Tamil Nadu 641043
              <br />
              India
            </p>

          </div>

          {/* Social Media */}
          <div>

            <h4 className="text-green-400 font-semibold uppercase tracking-wider mb-5">
              Follow Us
            </h4>

            <div className="space-y-4">

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-red-500 transition"
              >
                <i className="fab fa-youtube"></i>
                YouTube
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-blue-500 transition"
              >
                <i className="fab fa-linkedin"></i>
                LinkedIn
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-pink-500 transition"
              >
                <i className="fab fa-instagram"></i>
                Instagram
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-blue-600 transition"
              >
                <i className="fab fa-facebook"></i>
                Facebook
              </a>

            </div>

          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-12 pt-6 text-center">

          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Jawa Edtech. All Rights Reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;
