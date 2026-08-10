import { useCallback, useEffect, useState } from "react";
import { BookOpen, Bookmark, CheckCircle2, Clock3, ExternalLink, RotateCcw, Search } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "../config/api";
import "./Learning.css";

function Learning() {
  const [activeTab, setActiveTab] = useState("explore");
  const [resources, setResources] = useState([]);
  const [skills, setSkills] = useState([]);
  const [filters, setFilters] = useState({ search: "", skill: "", difficulty: "", resource_type: "" });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const apiFetch = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem("access");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}`, ...options.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || Object.values(data)?.[0] || "Unable to load learning resources.");
    return data;
  }, []);

  const loadResources = useCallback(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value.trim() && params.set(key, value.trim()));
    if (activeTab === "saved") params.set("state", "saved");
    if (activeTab === "completed") params.set("state", "completed");
    setResources(await apiFetch(`/learning/resources/?${params.toString()}`));
  }, [activeTab, filters, apiFetch]);

  useEffect(() => {
    apiFetch("/learning/skills/").then(setSkills).catch(() => {});
  }, [apiFetch]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try { await loadResources(); }
      catch (err) { if (active) setError(typeof err.message === "string" ? err.message : "Unable to load learning resources."); }
      finally { if (active) setLoading(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [loadResources]);

  const updateProgress = async (resource, changes) => {
    setUpdatingId(resource.id);
    try {
      const updated = await apiFetch(`/learning/resources/${resource.id}/progress/`, { method: "PATCH", body: JSON.stringify(changes) });
      if (activeTab === "saved" && changes.is_bookmarked === false) setResources((items) => items.filter((item) => item.id !== resource.id));
      else if (activeTab === "completed" && changes.is_completed === false) setResources((items) => items.filter((item) => item.id !== resource.id));
      else setResources((items) => items.map((item) => item.id === resource.id ? updated : item));
      if ("is_bookmarked" in changes) toast.success(changes.is_bookmarked ? "Resource saved." : "Resource removed from saved.");
      else toast.success(changes.is_completed ? "Marked as completed." : "Marked as incomplete.");
    } catch (err) { toast.error(typeof err.message === "string" ? err.message : "Could not update progress."); }
    finally { setUpdatingId(null); }
  };

  const clearFilters = () => setFilters({ search: "", skill: "", difficulty: "", resource_type: "" });
  const setFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }));
  const tabs = [{ id: "explore", label: "Explore" }, { id: "saved", label: "Saved" }, { id: "completed", label: "Completed" }];

  return <section className="learning-page">
    <header className="learning-header"><div><span className="learning-eyebrow">Skill development</span><h1>Learning</h1><p>Curated resources to strengthen practical skills and keep your growth moving.</p></div><div className="learning-header-mark"><BookOpen size={25} /></div></header>
    <div className="learning-tabs" role="tablist" aria-label="Learning views">{tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</div>

    {activeTab === "explore" && <div className="learning-toolbar">
      <label className="learning-search"><Search size={18} /><input type="search" value={filters.search} onChange={(event) => setFilter("search", event.target.value)} placeholder="Search resources or skills" /></label>
      <select value={filters.skill} onChange={(event) => setFilter("skill", event.target.value)} aria-label="Filter by skill"><option value="">All skills</option>{skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select>
      <select value={filters.difficulty} onChange={(event) => setFilter("difficulty", event.target.value)} aria-label="Filter by difficulty"><option value="">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
      <select value={filters.resource_type} onChange={(event) => setFilter("resource_type", event.target.value)} aria-label="Filter by resource type"><option value="">All types</option><option value="course">Course</option><option value="article">Article</option><option value="video">Video</option><option value="documentation">Documentation</option></select>
      <button type="button" className="learning-clear" onClick={clearFilters}><RotateCcw size={16} /> Clear</button>
    </div>}

    {error ? <LearningState title="Unable to load resources" text={error} error /> : loading ? <LearningState text="Loading learning resources…" loading /> : resources.length === 0 ? <LearningState title={activeTab === "saved" ? "No saved resources" : activeTab === "completed" ? "No completed resources" : "No resources found"} text={activeTab === "explore" ? "Try changing your search or filters." : activeTab === "saved" ? "Bookmark useful resources from Explore." : "Completed resources will appear here."} /> : <div className="learning-grid">{resources.map((resource) => <ResourceCard key={resource.id} resource={resource} busy={updatingId === resource.id} onUpdate={updateProgress} showCompletedDate={activeTab === "completed"} />)}</div>}
  </section>;
}

function ResourceCard({ resource, busy, onUpdate, showCompletedDate }) {
  return <article className="learning-card">
    <div className="learning-card-meta"><span className="resource-type">{resource.resource_type}</span><span className={`difficulty difficulty-${resource.difficulty}`}>{resource.difficulty}</span></div>
    <span className="resource-skill">{resource.skill.name}</span><h2>{resource.title}</h2><p className="resource-description">{resource.description}</p>
    {resource.estimated_duration && <p className="resource-duration"><Clock3 size={15} /> {resource.estimated_duration}</p>}
    {showCompletedDate && resource.completed_at && <p className="completion-date"><CheckCircle2 size={15} /> Completed {new Date(resource.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
    <div className="learning-card-actions"><button type="button" className={resource.is_bookmarked ? "bookmark-action active" : "bookmark-action"} disabled={busy} onClick={() => onUpdate(resource, { is_bookmarked: !resource.is_bookmarked })}><Bookmark size={17} fill={resource.is_bookmarked ? "currentColor" : "none"} />{resource.is_bookmarked ? "Saved" : "Save"}</button><button type="button" className={resource.is_completed ? "complete-action active" : "complete-action"} disabled={busy} onClick={() => onUpdate(resource, { is_completed: !resource.is_completed })}><CheckCircle2 size={17} />{resource.is_completed ? "Completed" : "Mark Complete"}</button></div>
    <a className="open-resource" href={resource.resource_url} target="_blank" rel="noopener noreferrer">Open Resource <ExternalLink size={16} /></a>
  </article>;
}

function LearningState({ title, text, loading, error }) { return <div className={`learning-state${error ? " error" : ""}`}>{loading ? <div className="learning-loader" /> : <BookOpen size={34} />} {title && <h2>{title}</h2>}<p>{text}</p></div>; }

export default Learning;
