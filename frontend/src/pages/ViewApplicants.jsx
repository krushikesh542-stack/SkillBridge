import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../config/api";
import "./ViewApplicants.css";

const formatStatus = (status = "pending") => status.charAt(0).toUpperCase() + status.slice(1);
const formatDate = (value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function whatsappHref(number) {
  const digits = (number || "").replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? `https://wa.me/${digits}` : "";
}

function ViewApplicants() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true); setError("");
        const token = localStorage.getItem("access");
        if (!token) throw new Error("Please log in again.");
        const response = await fetch(`${API_URL}/applications/opportunity/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Unable to load applicants.");
        setApplications(Array.isArray(data) ? data : data.results || []);
      } catch (requestError) { setError(requestError.message); }
      finally { setLoading(false); }
    }
    fetchApplications();
  }, [id]);

  async function handleStatusUpdate(applicationId, status) {
    try {
      setUpdatingId(applicationId); setError("");
      const response = await fetch(`${API_URL}/applications/${applicationId}/status/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not update application status.");
      setApplications((items) => items.map((item) => item.id === applicationId ? { ...item, status: data.status } : item));
    } catch (requestError) { setError(requestError.message); }
    finally { setUpdatingId(null); }
  }

  async function downloadResume(application) {
    try {
      setDownloadingId(application.id); setError("");
      const response = await fetch(application.resume_download_url, { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Could not download the resume.");
      }
      const blobUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = blobUrl; anchor.download = `application-${application.id}-resume.pdf`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(blobUrl);
    } catch (requestError) { setError(requestError.message); }
    finally { setDownloadingId(null); }
  }

  if (loading) return <div className="applicants-page">Loading applicants...</div>;
  if (error && applications.length === 0) return <div className="applicants-page error"><p>{error}</p><Link to="/opportunities/my" className="back-button">← Back to My Opportunities</Link></div>;

  return <div className="applicants-page">
    <div className="applicants-header"><div><span className="applicants-eyebrow">Recruiter Workspace</span><h1>Applicants</h1><p>Review applicant profiles and update their application status.</p></div><div className="applicants-count">{applications.length}</div></div>
    {error && <p className="applicants-inline-error">{error}</p>}
    {applications.length === 0 ? <div className="no-applicants-state"><h2>No one has applied yet</h2><p>Applicants will appear here after students apply for this opportunity.</p></div> :
      <div className="applicants-list">{applications.map((application) => {
        const profile = application.applicant_profile || {};
        const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.username || "Applicant";
        const expanded = expandedId === application.id;
        const whatsApp = whatsappHref(application.whatsapp_number);
        return <article key={application.id} className="applicant-card">
          <div className="applicant-card-header">
            <div className="applicant-avatar">{profile.profile_image ? <img src={profile.profile_image} alt="" /> : fullName.charAt(0).toUpperCase()}</div>
            <div className="applicant-identity"><h2>{fullName}</h2><p>{profile.headline || "Student applicant"}</p><small>Applied {formatDate(application.applied_at)}</small></div>
            <span className={`applicant-status status-${application.status}`}>{formatStatus(application.status)}</span>
          </div>
          <button type="button" className="view-profile-button" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? null : application.id)}>{expanded ? "Hide Profile" : "View Profile"}</button>
          {expanded && <div className="applicant-expanded">
            <section><h3>Professional</h3><div className="applicant-detail-grid"><p><strong>College</strong>{profile.college || "Not provided"}</p><p><strong>Degree</strong>{profile.degree || "Not provided"}</p><p><strong>Graduation year</strong>{profile.graduation_year || "Not provided"}</p><p><strong>Location</strong>{profile.location || "Not provided"}</p></div><div className="applicant-skills">{profile.skills?.length ? profile.skills.map((skill) => <span key={skill.id}>{skill.name}</span>) : <span>No skills provided</span>}</div>{profile.bio && <p className="applicant-bio">{profile.bio}</p>}</section>
            <section><h3>Contact</h3><div className="applicant-contact-list">{application.contact_email ? <a href={`mailto:${application.contact_email}`}>{application.contact_email}</a> : <span>Email not captured</span>}{whatsApp ? <a href={whatsApp} target="_blank" rel="noopener noreferrer">{application.whatsapp_number}</a> : <span>{application.whatsapp_number || "WhatsApp not captured"}</span>}{application.linkedin_url && <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</a>}{application.github_url && <a href={application.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>}{profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">Portfolio</a>}</div></section>
            <section><h3>Application</h3><div className="applicant-detail-grid"><p><strong>Application ID</strong>{application.id}</p><p><strong>Status</strong>{formatStatus(application.status)}</p><p><strong>Applied</strong>{formatDate(application.applied_at)}</p></div>{application.has_resume && <button type="button" className="resume-download-button" onClick={() => downloadResume(application)} disabled={downloadingId === application.id}>{downloadingId === application.id ? "Downloading..." : "View Resume"}</button>}</section>
          </div>}
          <div className="status-buttons"><button type="button" className="accept-status-button" onClick={() => handleStatusUpdate(application.id, "accepted")} disabled={updatingId === application.id}>Accept</button><button type="button" className="reviewing-status-button" onClick={() => handleStatusUpdate(application.id, "reviewing")} disabled={updatingId === application.id}>Reviewing</button><button type="button" className="reject-status-button" onClick={() => handleStatusUpdate(application.id, "rejected")} disabled={updatingId === application.id}>Reject</button></div>
        </article>;
      })}</div>}
    <Link to="/opportunities/my" className="back-button">← Back to My Opportunities</Link>
  </div>;
}

export default ViewApplicants;
