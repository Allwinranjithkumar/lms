function Features() {
  const features = [
    {
      icon: "fa-solid fa-robot",
      title: "AI Assistant",
      description:
        "Get 24/7 personalized tutoring and instant answers to your study questions from our advanced AI model.",
    },
    {
      icon: "fa-solid fa-book-open",
      title: "Course Management",
      description:
        "Intuitively organize curriculum, drag-and-drop materials, and manage student enrollments effortlessly.",
    },
    {
      icon: "fa-solid fa-video",
      title: "Live Virtual Classes",
      description:
        "High-definition interactive streaming with integrated chat, polls, and whiteboard collaboration.",
    },
    {
      icon: "fa-solid fa-clipboard-check",
      title: "Assessments & Quizzes",
      description:
        "Automated grading and diverse assessment types including adaptive quizzes that adjust to student level.",
    },
    {
      icon: "fa-solid fa-chart-simple",
      title: "Progress Tracking",
      description:
        "Visualize learning milestones with real-time data analytics and detailed student performance reports.",
    },
    {
      icon: "fa-regular fa-message",
      title: "Communication Hub",
      description:
        "Centralized messaging, discussion forums, and announcement systems to keep everyone connected.",
    },
  ];

  return (
    <section
      id="features"
      className="bg-green-50 dark:bg-[#181c22] py-24 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-8">

        {/* Heading */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Learn Smarter, Achieve Faster
          </h2>

          <div className="w-24 h-1.5 bg-green-600 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-white
                dark:bg-[#10141a]
                p-8
                rounded-3xl
                shadow-sm
                hover:shadow-xl
                transition-all
                duration-300
                hover:-translate-y-1
                border
                border-gray-100
                dark:border-gray-800
              "
            >
              <div
                className="
                  w-14
                  h-14
                  bg-green-100
                  dark:bg-green-500/10
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  text-3xl
                  mb-6
                "
              >
                <i className={feature.icon}></i>
              </div>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {feature.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

export default Features;
