import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../config/api";
import "./OpportunityDetails.css";

function OpportunityDetails({ user }) {
  const { id } = useParams();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileResume, setProfileResume] = useState("");
  const [applicationForm, setApplicationForm] = useState({
    contact_email: "", whatsapp_number: "", linkedin_url: "", github_url: "", use_profile_resume: false,
  });

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoading(true);
        setError("");

        const accessToken = localStorage.getItem("access");

        if (!accessToken) {
          throw new Error("Please log in again.");
        }

        const [opportunityResponse, applicationsResponse] =
          await Promise.all([
            fetch(`${API_URL}/opportunities/${id}/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }),

            fetch(`${API_URL}/applications/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }),
          ]);

        if (
          opportunityResponse.status === 401 ||
          applicationsResponse.status === 401
        ) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          throw new Error(
            "Your login session expired. Please log in again."
          );
        }

        const opportunityData = await opportunityResponse.json();
        const applicationsData = await applicationsResponse.json();

        if (!opportunityResponse.ok) {
          throw new Error(
            opportunityData.detail ||
              "Could not load this opportunity."
          );
        }

        if (!applicationsResponse.ok) {
          throw new Error(
            applicationsData.detail ||
              "Could not check your application status."
          );
        }

        setOpportunity(opportunityData);

        const hasApplied = applicationsData.some(
          (application) =>
            Number(application.opportunity) === Number(id)
        );

        setAlreadyApplied(hasApplied);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, [id]);

  async function handleApply() {
    try {
      setProfileLoading(true);
      setApplicationMessage("");
      const accessToken = localStorage.getItem("access");
      if (!accessToken) throw new Error("Please log in again.");
      const response = await fetch(`${API_URL}/profiles/me/`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not load your profile.");
      setApplicationForm({
        contact_email: data.email || user?.email || "",
        whatsapp_number: data.whatsapp_number || "",
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || "",
        use_profile_resume: Boolean(data.resume),
      });
      setProfileResume(data.resume || "");
      setShowApplicationForm(true);
    } catch (err) {
      setApplicationMessage(err.message);
    } finally {
      setProfileLoading(false);
    }
  }

  function handleApplicationChange({ target }) {
    setApplicationForm((current) => ({ ...current, [target.name]: target.type === "checkbox" ? target.checked : target.value }));
  }

  async function handleApplicationSubmit(event) {
    event.preventDefault();
    try {
      setApplying(true);
      setApplicationMessage("");

      const accessToken = localStorage.getItem("access");

      if (!accessToken) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API_URL}/applications/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opportunity: Number(id),
          ...applicationForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          data.detail ===
          "You have already applied for this opportunity."
        ) {
          setAlreadyApplied(true);
        }

        throw new Error(
          data.detail || "Could not submit your application."
        );
      }

      setAlreadyApplied(true);
      setShowApplicationForm(false);
      setApplicationMessage(
        "Application submitted successfully!"
      );
    } catch (err) {
      setApplicationMessage(err.message);
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="opportunity-details-state">
        Loading opportunity...
      </div>
    );
  }

  if (error) {
    return (
      <div className="opportunity-details-state error-state">
        <p>{error}</p>

        <Link to="/opportunities">
          Back to opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="opportunity-details-page">
      <Link className="back-link" to="/opportunities">
        ← Back to opportunities
      </Link>

      <section className="opportunity-hero">
        <div>
          <span className="opportunity-type">
            {opportunity.opportunity_type}
          </span>

          <h1>{opportunity.title}</h1>

          <p className="details-company">
            {opportunity.company_name}
          </p>
        </div>

        <span className="work-mode">
          {opportunity.work_mode}
        </span>
      </section>

      <div className={`opportunity-details-layout ${user?.role === "student" ? "" : "no-apply"}`}>
        <main className="opportunity-main-content">
          <section className="details-section">
            <h2>About the opportunity</h2>
            <p>{opportunity.description}</p>
          </section>

          <section className="details-section">
            <h2>Required skills</h2>

            <div className="skill-list">
              {opportunity.skills.length > 0 ? (
                opportunity.skills.map((skill) => (
                  <span
                    className="skill-tag"
                    key={skill.id}
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <p>No specific skills listed.</p>
              )}
            </div>
          </section>

          <section className="details-section">
            <h2>Opportunity details</h2>

            <div className="details-grid">
              <div>
                <span>Location</span>
                <strong>
                  {opportunity.location || "Not specified"}
                </strong>
              </div>

              <div>
                <span>Work mode</span>
                <strong>{opportunity.work_mode}</strong>
              </div>

              <div>
                <span>Experience level</span>
                <strong>
                  {opportunity.experience_level}
                </strong>
              </div>

              <div>
                <span>Opportunity type</span>
                <strong>
                  {opportunity.opportunity_type}
                </strong>
              </div>

              <div>
                <span>Stipend</span>
                <strong>
                  {opportunity.stipend
                    ? `₹${Number(
                        opportunity.stipend
                      ).toLocaleString("en-IN")}/month`
                    : "Unpaid"}
                </strong>
              </div>

              <div>
                <span>Deadline</span>
                <strong>
                  {opportunity.application_deadline ||
                    "Open"}
                </strong>
              </div>
            </div>
          </section>
        </main>

        {user?.role === "student" && <aside className="apply-panel">
          <h2>
            {alreadyApplied
              ? "Application submitted"
              : "Interested in this role?"}
          </h2>

          <p>
            {alreadyApplied
              ? "You have already applied for this opportunity. You can track its status from My Applications."
              : "Review the details carefully before submitting your application."}
          </p>

          <button
            type="button"
            className={`apply-button ${
              alreadyApplied ? "already-applied" : ""
            }`}
            onClick={handleApply}
            disabled={applying || profileLoading || alreadyApplied || showApplicationForm}
          >
            {profileLoading
              ? "Loading profile..."
              : alreadyApplied
                ? "✓ Already Applied"
                : "Apply Now"}
          </button>

          {showApplicationForm && !alreadyApplied && (
            <form className="application-confirmation" onSubmit={handleApplicationSubmit}>
              <p className="application-sharing-notice">These contact details will be shared with the recruiter for this application.</p>
              <label htmlFor="contact_email">Contact email <span>*</span></label>
              <input id="contact_email" name="contact_email" type="email" required value={applicationForm.contact_email} onChange={handleApplicationChange} />
              <label htmlFor="whatsapp_number">WhatsApp / Phone <span>*</span></label>
              <input id="whatsapp_number" name="whatsapp_number" type="tel" required value={applicationForm.whatsapp_number} onChange={handleApplicationChange} placeholder="+91 98765 43210" />
              <label htmlFor="linkedin_url">LinkedIn URL <small>Optional</small></label>
              <input id="linkedin_url" name="linkedin_url" type="url" value={applicationForm.linkedin_url} onChange={handleApplicationChange} />
              <label htmlFor="github_url">GitHub URL <small>Optional</small></label>
              <input id="github_url" name="github_url" type="url" value={applicationForm.github_url} onChange={handleApplicationChange} />
              {profileResume ? (
                <label className="profile-resume-choice">
                  <input name="use_profile_resume" type="checkbox" checked={applicationForm.use_profile_resume} onChange={handleApplicationChange} />
                  <span>Use my profile resume</span>
                </label>
              ) : <p className="no-profile-resume">No profile resume is available. You can still apply without one.</p>}
              <div className="application-confirmation-actions">
                <button type="button" onClick={() => setShowApplicationForm(false)} disabled={applying}>Cancel</button>
                <button type="submit" disabled={applying}>{applying ? "Submitting..." : "Submit Application"}</button>
              </div>
            </form>
          )}

          {applicationMessage && (
            <p
              className={`application-message ${
                alreadyApplied ? "success-message" : ""
              }`}
            >
              {applicationMessage}
            </p>
          )}

          {alreadyApplied && (
            <Link
              to="/applications"
              className="view-applications-link"
            >
              View My Applications
            </Link>
          )}

          <div className="posted-by">
            <span>Organization</span>
            <strong>
              {opportunity.company_name}
            </strong>
          </div>
        </aside>}
      </div>
    </div>
  );
}

export default OpportunityDetails;
