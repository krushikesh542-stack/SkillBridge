import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import "./MyOpportunities.css";
import { API_URL } from "../config/api";

function MyOpportunities() {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMyOpportunities() {
      try {
        setLoading(true);
        setError("");

        const accessToken = localStorage.getItem("access");

        if (!accessToken) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/opportunities/my/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not load your opportunities."
          );
        }

        setOpportunities(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadMyOpportunities();
  }, [navigate]);

  async function handleDelete(opportunityId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this opportunity?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(opportunityId);
      setError("");

      const accessToken = localStorage.getItem("access");

      const response = await fetch(
        `${API_URL}/opportunities/${opportunityId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.detail || "Could not delete the opportunity."
        );
      }

      setOpportunities((currentOpportunities) =>
        currentOpportunities.filter(
          (opportunity) => opportunity.id !== opportunityId
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "No deadline";
    }

    return new Date(`${dateValue}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatLabel(value) {
    if (!value) {
      return "";
    }

    return value
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  if (loading) {
    return (
      <section className="my-opportunities-page">
        <div className="my-opportunities-state">
          <div className="my-opportunities-loader" />
          <p>Loading your opportunities...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-opportunities-page">
      <div className="my-opportunities-header">
        <div>
          <span className="my-opportunities-eyebrow">
            Recruiter Workspace
          </span>

          <h1>My Opportunities</h1>

          <p>
            Manage the opportunities you have published on
            SkillBridge.
          </p>
        </div>

        <Link
          to="/opportunities/create"
          className="create-new-opportunity-button"
        >
          <Plus size={18} />
          Create Opportunity
        </Link>
      </div>

      {error && (
        <p className="my-opportunities-error">{error}</p>
      )}

      {opportunities.length === 0 ? (
        <div className="my-opportunities-empty">
          <div className="empty-opportunity-icon">
            <BriefcaseBusiness size={30} />
          </div>

          <h2>No opportunities created yet</h2>

          <p>
            Publish your first opportunity and start receiving
            applications from SkillBridge members.
          </p>

          <Link
            to="/opportunities/create"
            className="empty-create-button"
          >
            <Plus size={18} />
            Create Your First Opportunity
          </Link>
        </div>
      ) : (
        <div className="my-opportunities-grid">
          {opportunities.map((opportunity) => (
            <article
              className="my-opportunity-card"
              key={opportunity.id}
            >
              <div className="my-opportunity-card-top">
                <div className="opportunity-company-avatar">
                  {opportunity.company_name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="opportunity-card-heading">
                  <h2>{opportunity.title}</h2>
                  <p>{opportunity.company_name}</p>
                </div>

                <span
                  className={
                    opportunity.is_active
                      ? "opportunity-active-badge"
                      : "opportunity-inactive-badge"
                  }
                >
                  {opportunity.is_active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className="my-opportunity-tags">
                <span>
                  {formatLabel(
                    opportunity.opportunity_type
                  )}
                </span>

                <span>
                  {formatLabel(opportunity.work_mode)}
                </span>

                <span>
                  {formatLabel(
                    opportunity.experience_level
                  )}
                </span>
              </div>

              <div className="my-opportunity-details">
                <div>
                  <MapPin size={17} />
                  <span>
                    {opportunity.location ||
                      "Location not specified"}
                  </span>
                </div>

                <div>
                  <CalendarDays size={17} />
                  <span>
                    Deadline:{" "}
                    {formatDate(
                      opportunity.application_deadline
                    )}
                  </span>
                </div>
              </div>

              {opportunity.skills?.length > 0 && (
                <div className="my-opportunity-skills">
                  {opportunity.skills
                    .slice(0, 4)
                    .map((skill) => (
                      <span key={skill.id}>
                        {skill.name}
                      </span>
                    ))}

                  {opportunity.skills.length > 4 && (
                    <span>
                      +{opportunity.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              <div className="my-opportunity-actions">
                <Link
                  to={`/opportunities/${opportunity.id}`}
                  className="view-opportunity-action"
                >
                  <Eye size={17} />
                  View
                </Link>
                <Link
                  to={`/opportunities/${opportunity.id}/edit`}
                  className="edit-opportunity-action"
                >
                  <Pencil size={17} />
                  Edit
                </Link>

                <Link
                  to={`/opportunities/${opportunity.id}/applicants`}
                  className="view-applicants-action"
                >
                  <Users size={17} />
                  Applicants
                </Link>

                <button
                  type="button"
                  className="delete-opportunity-action"
                  onClick={() =>
                    handleDelete(opportunity.id)
                  }
                  disabled={deletingId === opportunity.id}
                >
                  <Trash2 size={17} />

                  {deletingId === opportunity.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyOpportunities;
