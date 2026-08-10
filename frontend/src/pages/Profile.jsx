import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Save, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import "./Profile.css";

const roleFields = {
  student: [
    ["headline", "Headline", "text"], ["location", "Location", "text"], ["bio", "Bio", "textarea"],
    ["college", "College", "text"], ["degree", "Degree", "text"], ["graduation_year", "Graduation Year", "number"],
    ["whatsapp_number", "WhatsApp / Phone", "tel"],
    ["github_url", "GitHub URL", "url"], ["linkedin_url", "LinkedIn URL", "url"], ["portfolio_url", "Portfolio URL", "url"],
  ],
  mentor: [
    ["headline", "Headline", "text"], ["company", "Company", "text"], ["job_title", "Job Title", "text"],
    ["years_of_experience", "Years of Experience", "number"], ["linkedin_url", "LinkedIn URL", "url"], ["bio", "Bio", "textarea"],
  ],
  startup: [
    ["startup_name", "Startup Name", "text"], ["industry", "Industry", "text"], ["location", "Location", "text"],
    ["website_url", "Website URL", "url"], ["linkedin_url", "LinkedIn URL", "url"], ["team_size", "Team Size", "number"],
    ["description", "Description", "textarea"],
  ],
};

function Profile({ user }) {
  const navigate = useNavigate();
  const role = user?.role || "student";
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`${API_URL}/profiles/me/`, { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Failed to load profile.");
        setProfile(data);
        const values = {};
        roleFields[role].forEach(([name]) => { values[name] = data[name] ?? ""; });
        if (role === "student") values.available_for_work = data.available_for_work;
        if (role === "mentor") values.is_available = data.is_available;
        if (role === "startup") values.stage = data.stage || "idea";
        setFormData(values);
        setSkills(data.skills?.map((skill) => skill.name) || []);
      } catch (requestError) { setError(requestError.message); }
      finally { setLoading(false); }
    }
    loadProfile();
  }, [role]);

  const handleChange = ({ target }) => setFormData((current) => ({ ...current, [target.name]: target.type === "checkbox" ? target.checked : target.value }));
  const addSkill = () => { const value = skillInput.trim(); if (value && !skills.includes(value)) setSkills((current) => [...current, value]); setSkillInput(""); };

  async function handleSubmit(event) {
    event.preventDefault(); setSubmitting(true); setMessage(""); setError("");
    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => body.append(key, value));
      if (role !== "startup") skills.forEach((skill) => body.append("skill_names", skill));
      if (mediaFile) body.append(role === "startup" ? "logo" : "profile_image", mediaFile);
      if (role === "student" && resumeFile) body.append("resume", resumeFile);
      const response = await fetch(`${API_URL}/profiles/me/`, { method: "PATCH", headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }, body });
      const data = await response.json();
      if (!response.ok) { const first = Object.values(data)?.[0]; throw new Error(Array.isArray(first) ? first[0] : data.detail || "Failed to update profile."); }
      setProfile(data); setMessage("Profile updated successfully!");
    } catch (requestError) { setError(requestError.message); }
    finally { setSubmitting(false); }
  }

  if (loading) return <section className="page-placeholder reveal show"><p>Loading profile…</p></section>;
  if (error && !profile) return <section className="page-placeholder reveal show"><h2>Unable to load profile</h2><p>{error}</p></section>;

  const title = role === "startup" ? "Startup Profile" : role === "mentor" ? "Mentor Profile" : "Your Profile";
  return <section className="profile-page">
    <div className="profile-header"><span className="eyebrow">Professional identity</span><h1>{title}</h1><p>Manage the information shown across your SkillBridge network.</p></div>
    <form className="profile-form" onSubmit={handleSubmit}>
      <section className="form-card"><div className="form-card-heading"><Sparkles size={21} /><div><h2>Profile information</h2><p>Keep your role details accurate and current.</p></div></div>
        <div className="form-grid">{roleFields[role].map(([name, label, type]) => <div key={name} className={`form-group ${type === "textarea" ? "form-group-full" : ""}`}><label htmlFor={name}>{label}</label>{type === "textarea" ? <textarea id={name} name={name} rows={5} value={formData[name] ?? ""} onChange={handleChange} /> : <input id={name} name={name} type={type} min={type === "number" ? "0" : undefined} value={formData[name] ?? ""} onChange={handleChange} />}</div>)}
          {role === "startup" && <div className="form-group"><label htmlFor="stage">Stage</label><select id="stage" name="stage" value={formData.stage || "idea"} onChange={handleChange}><option value="idea">Idea Stage</option><option value="pre_seed">Pre-Seed</option><option value="seed">Seed</option><option value="series_a">Series A</option><option value="growth">Growth Stage</option></select></div>}
          {role !== "startup" && <div className="form-group form-group-full"><label htmlFor="availability">{role === "mentor" ? "Available for mentoring" : "Available for work"}</label><input id="availability" name={role === "mentor" ? "is_available" : "available_for_work"} type="checkbox" checked={Boolean(formData[role === "mentor" ? "is_available" : "available_for_work"])} onChange={handleChange} /></div>}
        </div>
      </section>

      {role !== "startup" && <section className="form-card"><div className="form-card-heading"><Sparkles size={21} /><div><h2>Skills</h2><p>Add your professional skills.</p></div></div><div className="skill-input-row"><input type="text" value={skillInput} onChange={(event) => setSkillInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addSkill())} placeholder="e.g., Python" /><button type="button" className="add-skill-button" onClick={addSkill}><CheckCircle2 size={18} /> Add Skill</button></div><div className="selected-skills">{skills.map((skill) => <span key={skill} className="selected-skill">{skill}<button type="button" onClick={() => setSkills((current) => current.filter((item) => item !== skill))} aria-label={`Remove ${skill}`}><X size={15} /></button></span>)}</div></section>}

      <section className="form-card"><div className="form-card-heading"><Sparkles size={21} /><div><h2>Media</h2><p>{role === "startup" ? "Upload your startup logo." : "Upload your profile image."}</p></div></div><div className="form-group"><label htmlFor="profile_media">{role === "startup" ? "Startup Logo" : "Profile Image"}</label><input id="profile_media" type="file" accept="image/*" onChange={(event) => setMediaFile(event.target.files[0])} /></div>{role === "student" && <div className="form-group"><label htmlFor="resume">Resume (PDF)</label><input id="resume" type="file" accept="application/pdf" onChange={(event) => setResumeFile(event.target.files[0])} />{profile?.resume && <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="view-resume-button"><FileText size={18} /> View Resume</a>}</div>}</section>
      {message && <p className="create-form-message success">{message}</p>}{error && <p className="create-form-message error">{error}</p>}
      <div className="create-form-actions"><button type="button" className="cancel-create-button" onClick={() => navigate("/dashboard")} disabled={submitting}>Cancel</button><button type="submit" className="publish-opportunity-button" disabled={submitting}><Save size={18} />{submitting ? "Saving…" : "Save Profile"}</button></div>
    </form>
  </section>;
}

export default Profile;
