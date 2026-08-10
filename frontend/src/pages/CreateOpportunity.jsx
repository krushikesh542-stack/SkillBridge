import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  IndianRupee,
  MapPin,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import "./CreateOpportunity.css";
import { API_URL } from "../config/api";

function CreateOpportunity() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    description: "",
    location: "",
    opportunity_type: "internship",
    work_mode: "remote",
    experience_level: "beginner",
    stipend: "",
    application_deadline: "",
    is_active: true,
  });

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function addSkill() {
    const cleanedSkill = skillInput.trim();

    if (!cleanedSkill) {
      return;
    }

    const alreadyExists = skills.some(
      (skill) => skill.toLowerCase() === cleanedSkill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setSkills((currentSkills) => [
      ...currentSkills,
      cleanedSkill,
    ]);

    setSkillInput("");
  }

  function handleSkillKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skillToRemove) {
    setSkills((currentSkills) =>
      currentSkills.filter(
        (skill) => skill !== skillToRemove
      )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const accessToken = localStorage.getItem("access");

      if (!accessToken) {
        throw new Error("Please log in again.");
      }

      const payload = {
        ...formData,
        stipend: formData.stipend
          ? Number(formData.stipend)
          : null,
        application_deadline:
          formData.application_deadline || null,
        skill_names: skills,
      };

      const response = await fetch(
        `${API_URL}/opportunities/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        throw new Error(
          "Your login session expired. Please log in again."
        );
      }

      if (!response.ok) {
        const firstError = Object.values(data)?.[0];

        throw new Error(
          Array.isArray(firstError)
            ? firstError[0]
            : data.detail ||
                "Could not publish the opportunity."
        );
      }

      setMessage("Opportunity published successfully!");

      setTimeout(() => {
        navigate(`/opportunities/${data.id}`);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="create-opportunity-page">
      <div className="create-opportunity-header">
        <div>
          <span className="create-opportunity-eyebrow">
            Recruiter Workspace
          </span>

          <h1>Create Opportunity</h1>

          <p>
            Publish an internship, job, project, or freelance
            opportunity for SkillBridge members.
          </p>
        </div>

        <div className="create-header-icon">
          <Sparkles size={25} />
        </div>
      </div>

      <form
        className="create-opportunity-form"
        onSubmit={handleSubmit}
      >
        <section className="form-card">
          <div className="form-card-heading">
            <BriefcaseBusiness size={21} />

            <div>
              <h2>Basic information</h2>
              <p>Enter the main details for this opportunity.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="title">
                Opportunity title
                <span>*</span>
              </label>

              <div className="input-with-icon">
                <BriefcaseBusiness size={18} />

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: Python Developer Intern"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="company_name">
                Company name
                <span>*</span>
              </label>

              <div className="input-with-icon">
                <Building2 size={18} />

                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Example: SkillBridge"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>

              <div className="input-with-icon">
                <MapPin size={18} />

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Example: Bengaluru"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="opportunity_type">
                Opportunity type
              </label>

              <select
                id="opportunity_type"
                name="opportunity_type"
                value={formData.opportunity_type}
                onChange={handleChange}
              >
                <option value="internship">
                  Internship
                </option>
                <option value="job">Job</option>
                <option value="project">Project</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="work_mode">Work mode</label>

              <select
                id="work_mode"
                name="work_mode"
                value={formData.work_mode}
                onChange={handleChange}
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experience_level">
                Experience level
              </label>

              <select
                id="experience_level"
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">
                  Intermediate
                </option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="stipend">
                Monthly stipend or salary
              </label>

              <div className="input-with-icon">
                <IndianRupee size={18} />

                <input
                  id="stipend"
                  name="stipend"
                  type="number"
                  min="0"
                  value={formData.stipend}
                  onChange={handleChange}
                  placeholder="Example: 15000"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="application_deadline">
                Application deadline
              </label>

              <div className="input-with-icon">
                <CalendarDays size={18} />

                <input
                  id="application_deadline"
                  name="application_deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="description">
                Description
                <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, requirements, and expected outcomes."
                rows="8"
                required
              />
            </div>
          </div>
        </section>

        <section className="form-card">
          <div className="form-card-heading">
            <Sparkles size={21} />

            <div>
              <h2>Required skills</h2>
              <p>
                Add the technologies or professional skills
                required.
              </p>
            </div>
          </div>

          <div className="skill-input-row">
            <input
              type="text"
              value={skillInput}
              onChange={(event) =>
                setSkillInput(event.target.value)
              }
              onKeyDown={handleSkillKeyDown}
              placeholder="Example: Python"
            />

            <button
              type="button"
              className="add-skill-button"
              onClick={addSkill}
            >
              <Plus size={18} />
              Add Skill
            </button>
          </div>

          {skills.length > 0 ? (
            <div className="selected-skills">
              {skills.map((skill) => (
                <span
                  className="selected-skill"
                  key={skill}
                >
                  {skill}

                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={15} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="no-skills-message">
              No skills added yet.
            </p>
          )}
        </section>

        {message && (
          <p className="create-form-message success">
            {message}
          </p>
        )}

        {error && (
          <p className="create-form-message error">
            {error}
          </p>
        )}

        <div className="create-form-actions">
          <button
            type="button"
            className="cancel-create-button"
            onClick={() => navigate("/opportunities")}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="publish-opportunity-button"
            disabled={submitting}
          >
            <Send size={18} />

            {submitting
              ? "Publishing..."
              : "Publish Opportunity"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreateOpportunity;
