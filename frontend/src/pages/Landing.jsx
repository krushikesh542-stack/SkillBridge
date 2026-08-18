import { Link } from "react-router-dom";
import BrandLogo from "../components/brand/BrandLogo";
import "./Landing.css";

export default function Landing() {
  return <div className="landing-page">
    <header className="landing-header">
      <Link to="/" aria-label="SkillBridge home"><BrandLogo variant="full" /></Link>
      <nav aria-label="Account navigation"><Link className="landing-signin" to="/login">Sign in</Link><Link className="landing-button" to="/register">Create account</Link></nav>
    </header>
    <main>
      <section className="landing-hero" aria-labelledby="landing-title">
        <p className="landing-eyebrow">Opportunities meet potential</p>
        <h1 id="landing-title">Build your next professional connection</h1>
        <p>SkillBridge brings students, mentors, and recruiters or startups together through career opportunities, learning, applications, mentorship, and meaningful professional connections.</p>
        <div className="landing-actions"><Link className="landing-button" to="/register">Create your SkillBridge account</Link><Link className="landing-secondary" to="/login">Sign in to your account</Link></div>
      </section>
      <section className="landing-audiences" aria-labelledby="audiences-title">
        <div className="landing-section-heading"><p className="landing-eyebrow">One connected community</p><h2 id="audiences-title">A place for every step of the journey</h2></div>
        <div className="landing-card-grid">
          <article><h3>For students</h3><p>Discover opportunities, manage applications, follow learning resources, and grow a professional network.</p></article>
          <article><h3>For mentors</h3><p>Share experience, connect with emerging talent, and support professional learning and growth.</p></article>
          <article><h3>For recruiters and startups</h3><p>Create opportunities, review applicants, and connect with people whose skills match your needs.</p></article>
        </div>
      </section>
      <section className="landing-cta" aria-labelledby="cta-title"><h2 id="cta-title">Ready to get started?</h2><p>Create an account with the role that fits you.</p><Link className="landing-button" to="/register">Create account</Link></section>
    </main>
    <footer className="landing-footer"><BrandLogo variant="full" /><p>Career opportunities, mentorship, learning, and professional connections.</p></footer>
  </div>;
}
