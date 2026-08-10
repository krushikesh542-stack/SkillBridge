import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  MapPin,
} from "lucide-react";

import "./MyApplications.css";
import { API_URL } from "../config/api";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      try {
        const token = localStorage.getItem("access");

      const response = await fetch(`${API_URL}/applications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load applications.");
      }

        setApplications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  if (loading) {
    return (
      <div className="applications-state">
        <div className="applications-loader"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-state error-state">
        <h2>Unable to load applications</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="applications-page">
      <div className="applications-header">
        <div>
          <span className="applications-eyebrow">Career Activity</span>
          <h1>My Applications</h1>
          <p>
            Track all the opportunities you have applied for in one place.
          </p>
        </div>

        <div className="applications-count">
          <BriefcaseBusiness size={20} />
          <span>{applications.length}</span>
          <small>
            {applications.length === 1 ? "Application" : "Applications"}
          </small>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="empty-applications">
          <div className="empty-applications-icon">
            <BriefcaseBusiness size={34} />
          </div>

          <h2>No applications yet</h2>

          <p>
            Explore available opportunities and submit your first application.
          </p>

          <Link to="/opportunities" className="browse-opportunities-btn">
            Browse Opportunities
          </Link>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map((application) => {
            const opportunity = application.opportunity_details;

            return (
              <article key={application.id} className="application-card">
                <div className="application-card-top">
                  <div className="company-avatar">
                    {opportunity?.company_name?.charAt(0).toUpperCase() || "S"}
                  </div>

                  <div className="application-title-area">
                    <h2>
                      {opportunity?.title ||
                        `Opportunity #${application.opportunity}`}
                    </h2>

                    <div className="company-name">
                      <Building2 size={16} />
                      <span>
                        {opportunity?.company_name || "Company not available"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`status-badge status-${application.status.toLowerCase()}`}
                  >
                    {formatStatus(application.status)}
                  </span>
                </div>

                <div className="application-details">
                  <div className="application-detail-item">
                    <MapPin size={17} />
                    <span>{opportunity?.location || "Location not available"}</span>
                  </div>

                  <div className="application-detail-item">
                    <CalendarDays size={17} />
                    <span>
                      Applied{" "}
                      {new Date(application.applied_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/opportunities/${application.opportunity}`}
                  className="view-opportunity-btn"
                >
                  View Opportunity
                  <ExternalLink size={17} />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyApplications;
