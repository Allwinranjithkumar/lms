function Preview() {
  const previews = [
    {
      title: "Student Dashboard",
      description:
        "Focused learning view for maximum engagement.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDbAaZKYQbPVozHtZVoElxHfsI6QRJV0mIwyc-3BZcFzf_EsT4gU3h8S53lVk43L3ys9i6kfczj44SovUwbt6pTjx0NmssdBiqkUrYXykVEnibUc-uU8OEKLeMzkonDCDbiV9wCELuUN3PGaHfP1h-rmHa4vamLnyVS8DgQ7S1mFWxATCieklVREGk8hUk3as9nL04Ye7UQQOq9Ah7UKGEI4nNkyKkopEpKqb0tkMDn6Nm32ODpHjcDsOqIKI0zdEgRixPN9QAa9ZM",
    },
    {
      title: "Teacher Dashboard",
      description:
        "Comprehensive tools for educator success.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCprG31ZETyK2KsacNKkm2q6d2Iq9ZqbCyD4_6Hs7TuB-md19DbseODuo4pnHb63BPE759YTUL3L5VBwDzRjZSZld5T03L9wORKJVPX0Gs-4pl77a_104fdHUhNLNz4S0GnEqnDy-1aiUttfM7kWh5UKqXgy0AJ2SZwez4h9WLwQNloRk1k0uS6wcVytBu3dsLLOhko9x7gsSo6zfKf6vQbXSvJZ1YYj7evPdCIWjWrdA8jmM_mtrRGSpoai3qQ4zopOrudcj9DD5A",
      featured: true,
    },
    {
      title: "Analytics Dashboard",
      description:
        "Deep insights into learning outcomes.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDjiq0JlfvFnaOBJtByuc6dbpZNJ3ozz_h7lCLFKUS9ooPkXoaH09Tf4MAXQDL7C4KAvRPKYoafRiS9MfR0UEyUlrSkyrHI0Yp1A0CECsOvjUV5KXcctz6WMQBkFuT3cy3H7PasYAEvozB4tvw_OwEwimSwGLRDyjZkcLOfBeZu-J_PPxrNzl1SGm9tXuhMorj_sJLC2PcEEMqWJzF4_Dnsbpz8Jl0hqonTZaCtmLOHJUDStHsu9g5HIqUiHkzqek6R1nhPytu3uY4",
    },
  ];

  return (
    <section
      id="Preview"
      className="bg-white dark:bg-[#10141a] py-24 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-8">

        {/* Heading */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Experience the Platform
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            See how Jawa Edtech transforms the educational
            experience for every role in the ecosystem.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {previews.map((item, index) => (
            <div
              key={index}
              className={`group ${
                item.featured ? "lg:scale-110" : ""
              }`}
            >
              <div
                className={`
                  rounded-3xl
                  overflow-hidden
                  transition-all
                  duration-500
                  ${
                    item.featured
                      ? "shadow-2xl border-2 border-green-500/20"
                      : "shadow-lg hover:shadow-2xl border"
                  }
                  bg-white
                  dark:bg-[#181c22]
                  border-gray-200
                  dark:border-gray-800
                `}
              >

                {/* Browser Header */}
                <div className="p-4 bg-gray-100 dark:bg-[#10141a]">

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>

                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full rounded-xl"
                  />
                </div>

                {/* Content */}
                <div className="p-6 text-center">

                  <h3
                    className={`text-xl font-bold ${
                      item.featured
                        ? "text-green-600"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {item.description}
                  </p>

                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Preview;