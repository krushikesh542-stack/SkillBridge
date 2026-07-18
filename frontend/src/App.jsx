import { ArrowRight, BriefcaseBusiness, Rocket, Users } from "lucide-react";
import "./App.css";

function App() {
  const features = [
    {
      icon: <Users size={28} />,
      title: "Discover Talent",
      description:
        "Startups can discover students and freshers through verified skills and real projects.",
    },
    {
      icon: <Rocket size={28} />,
      title: "Join Startups",
      description:
        "Students can find internships, micro-projects and early-stage startup opportunities.",
    },
    {
      icon: <BriefcaseBusiness size={28} />,
      title: "Build Experience",
      description:
        "Complete meaningful work, receive feedback and strengthen your professional profile.",
    },
  ];

  return (
    <main>
      <nav className="navbar">
        <div className="logo">
          Skill<span>Bridge</span>
        </div>

        <div className="nav-actions">
          <button className="login-button">Log in</button>
          <button className="primary-button">Join SkillBridge</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">Connecting talent with startups</div>

        <h1>
          Where ambitious students meet
          <span> growing startups.</span>
        </h1>

        <p>
          Discover micro-internships, startup projects and mentorship
          opportunities based on your skills—not only your experience.
        </p>

        <div className="hero-actions">
          <button className="primary-button large-button">
            Explore opportunities
            <ArrowRight size={18} />
          </button>

          <button className="secondary-button large-button">
            Find startup talent
          </button>
        </div>
      </section>

      <section className="features">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <div className="feature-icon">{feature.icon}</div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;