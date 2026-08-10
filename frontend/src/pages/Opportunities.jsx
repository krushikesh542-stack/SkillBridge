import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { API_URL } from "../config/api";
import "../styles/opportunities.css";

function Opportunities() {
  const location = useLocation();
  const urlSearchParam = new URLSearchParams(location.search).get("search") || "";

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState(urlSearchParam);
  const [previousUrlSearch, setPreviousUrlSearch] = useState(urlSearchParam);
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  if (previousUrlSearch !== urlSearchParam) {
    setPreviousUrlSearch(urlSearchParam);
    setSearchTerm(urlSearchParam);
  }

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError("");

        const accessToken = localStorage.getItem("access");

        if (!accessToken) {
          throw new Error("Please log in again.");
        }

        const fetchUrl = urlSearchParam
          ? `${API_URL}/opportunities/?search=${encodeURIComponent(urlSearchParam)}`
          : `${API_URL}/opportunities/`;

        const response = await fetch(
          fetchUrl,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          throw new Error(
            "Your login session expired. Please log in again."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not load opportunities."
          );
        }

        setOpportunities(
          Array.isArray(data) ? data : data.results || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
    }, [urlSearchParam]);

  const filteredOpportunities = opportunities.filter(
    (opportunity) => {
      const searchValue = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        opportunity.title
          ?.toLowerCase()
          .includes(searchValue) ||
        opportunity.company_name
          ?.toLowerCase()
          .includes(searchValue) ||
        opportunity.location
          ?.toLowerCase()
          .includes(searchValue) ||
        opportunity.skills?.some((skill) =>
          skill.name
            ?.toLowerCase()
            .includes(searchValue)
        );

      const matchesWorkMode =
        workModeFilter === "all" ||
        opportunity.work_mode === workModeFilter;

      const matchesType =
        typeFilter === "all" ||
        opportunity.opportunity_type === typeFilter;

      return (
        matchesSearch &&
        matchesWorkMode &&
        matchesType
      );
    }
  );

  function formatLabel(value) {
    if (!value) {
      return "";
    }

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function clearFilters() {
    setSearchTerm("");
    setWorkModeFilter("all");
    setTypeFilter("all");
  }

  if (loading) {
    return (
      <div className="opportunities-page">
        <div className="opportunities-state">
          Loading opportunities...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="opportunities-page">
        <div className="opportunities-state error-state">
          <h2>Unable to load opportunities</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="opportunities-page">
      <div className="opportunities-header">
        <div>
          <p className="page-label">
            Explore
          </p>

          <h1>Opportunities</h1>

          <p>
            Discover internships, jobs and projects
            matching your skills.
          </p>
        </div>
      </div>

      <div className="opportunities-toolbar">
        <div className="opportunities-search">
          <input
            type="search"
            placeholder="Search by title, company, location, or skill..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <select
          value={workModeFilter}
          onChange={(event) =>
            setWorkModeFilter(event.target.value)
          }
        >
          <option value="all">
            All work modes
          </option>

          <option value="remote">
            Remote
          </option>

          <option value="onsite">
            On-site
          </option>

          <option value="hybrid">
            Hybrid
          </option>
        </select>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
          }
        >
          <option value="all">
            All opportunity types
          </option>

          <option value="internship">
            Internship
          </option>

          <option value="job">
            Job
          </option>

          <option value="project">
            Project
          </option>

          <option value="freelance">
            Freelance
          </option>
        </select>

        <button
          type="button"
          className="clear-filters-button"
          onClick={clearFilters}
        >
          Clear filters
        </button>
      </div>

      <div className="opportunities-results-row">
        <span>
          {filteredOpportunities.length}{" "}
          {filteredOpportunities.length === 1
            ? "opportunity"
            : "opportunities"}{" "}
          found
        </span>
      </div>

      {filteredOpportunities.length === 0 ? (
        <div className="empty-state">
          <h2>No opportunities found</h2>

          <p>
            Try changing your search or filters.
          </p>

          <button
            type="button"
            className="clear-filters-button"
            onClick={clearFilters}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="opportunities-grid">
          {filteredOpportunities.map(
            (opportunity) => (
              <article
                className="opportunity-card"
                key={opportunity.id}
              >
                <div className="opportunity-card-top">
                  <div>
                    <span className="opportunity-type">
                      {formatLabel(
                        opportunity.opportunity_type
                      )}
                    </span>

                    <h2>
                      {opportunity.title}
                    </h2>

                    <p className="company-name">
                      {opportunity.company_name}
                    </p>
                  </div>

                  <span className="work-mode">
                    {formatLabel(
                      opportunity.work_mode
                    )}
                  </span>
                </div>

                <p className="opportunity-description">
                  {opportunity.description}
                </p>

                <div className="opportunity-details">
                  <span>
                    📍{" "}
                    {opportunity.location ||
                      "Not specified"}
                  </span>

                  <span>
                    💰{" "}
                    {opportunity.stipend
                      ? `₹${Number(
                          opportunity.stipend
                        ).toLocaleString(
                          "en-IN"
                        )}/month`
                      : "Unpaid"}
                  </span>

                  <span>
                    🎯{" "}
                    {formatLabel(
                      opportunity.experience_level
                    )}
                  </span>
                </div>

                <div className="skill-list">
                  {opportunity.skills?.length > 0 ? (
                    opportunity.skills.map(
                      (skill) => (
                        <span
                          className="skill-tag"
                          key={skill.id}
                        >
                          {skill.name}
                        </span>
                      )
                    )
                  ) : (
                    <span className="skill-tag">
                      No skills listed
                    </span>
                  )}
                </div>

                <div className="opportunity-card-footer">
                  <span>
                    Deadline:{" "}
                    {opportunity.application_deadline ||
                      "Open"}
                  </span>

                  <Link
                    className="view-details-button"
                    to={`/opportunities/${opportunity.id}`}
                  >
                    View Details
                  </Link>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Opportunities;
