import { useCallback, useEffect, useState } from "react";
import { Building2, Check, Clock3, MapPin, Search, UserPlus, UsersRound, X } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "../config/api";
import "./Connections.css";

function Connections() {
  const [activeTab, setActiveTab] = useState("discover");
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState([]);
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState("");

  const apiFetch = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem("access");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}`, ...options.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "Something went wrong. Please try again.");
    return data;
  }, []);

  const loadDiscover = useCallback(async (term = "") => {
    const query = term.trim() ? `?search=${encodeURIComponent(term.trim())}` : "";
    setPeople(await apiFetch(`/connections/discover/${query}`));
  }, [apiFetch]);

  const loadRequests = useCallback(async () => setRequests(await apiFetch("/connections/requests/")), [apiFetch]);
  const loadConnections = useCallback(async () => setConnections(await apiFetch("/connections/")), [apiFetch]);

  useEffect(() => {
    let active = true;
    async function preloadCounts() {
      try {
        const [requestData, connectionData] = await Promise.all([
          apiFetch("/connections/requests/"),
          apiFetch("/connections/"),
        ]);
        if (active) {
          setRequests(requestData);
          setConnections(connectionData);
        }
      } catch {
        // The active tab loader presents actionable API errors.
      }
    }
    preloadCounts();
    return () => { active = false; };
  }, [apiFetch]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      try {
        if (activeTab === "discover") await loadDiscover(search);
        else if (activeTab === "requests") await loadRequests();
        else await loadConnections();
      } catch (err) { if (active) setError(err.message); }
      finally { if (active) setLoading(false); }
    }, activeTab === "discover" ? 250 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [activeTab, search, loadDiscover, loadRequests, loadConnections]);

  const refreshAll = async () => Promise.all([loadDiscover(search), loadRequests(), loadConnections()]);

  const sendRequest = async (person) => {
    setActingId(person.id);
    try {
      await apiFetch("/connections/requests/", { method: "POST", body: JSON.stringify({ user_id: person.id }) });
      toast.success(person.relationship_state === "retry" ? "Connection request sent again." : "Connection request sent.");
      await refreshAll();
    } catch (err) { toast.error(err.message); }
    finally { setActingId(null); }
  };

  const respond = async (requestId, status) => {
    setActingId(requestId);
    try {
      await apiFetch(`/connections/requests/${requestId}/`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast.success(status === "accepted" ? "Connection accepted." : "Request rejected.");
      await refreshAll();
    } catch (err) { toast.error(err.message); }
    finally { setActingId(null); }
  };

  const tabs = [
    { id: "discover", label: "Discover", count: people.length },
    { id: "requests", label: "Requests", count: requests.length },
    { id: "connections", label: "My Connections", count: connections.length },
  ];

  return (
    <section className="connections-page">
      <header className="connections-header">
        <div><span className="connections-eyebrow">Professional network</span><h1>Connections</h1><p>Meet people across SkillBridge and grow your professional circle.</p></div>
        <div className="connections-summary"><UsersRound size={22} /><strong>{connections.length}</strong><span>connections</span></div>
      </header>

      <div className="connections-tabs" role="tablist" aria-label="Connection views">
        {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}<span>{tab.count}</span></button>)}
      </div>

      {activeTab === "discover" && <div className="connections-search"><Search size={19} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, role, organization, headline, or skill" aria-label="Search people" /></div>}

      {error ? <div className="connections-state error"><h2>Unable to load connections</h2><p>{error}</p></div> : loading ? <div className="connections-state"><div className="connections-loader" /><p>Loading your network…</p></div> : (
        <>
          {activeTab === "discover" && <CardGrid items={people} emptyTitle="No people found" emptyText="Try a different name, role, organization, or skill.">{(person) => <PersonCard key={person.id} person={person} action={<DiscoveryAction person={person} busy={actingId === person.id} onSend={sendRequest} />} />}</CardGrid>}
          {activeTab === "requests" && <CardGrid items={requests} emptyTitle="No pending requests" emptyText="New connection requests will appear here.">{(item) => <PersonCard key={item.id} person={item.person} action={<div className="request-actions"><button type="button" className="accept-connection" disabled={actingId === item.id} onClick={() => respond(item.id, "accepted")}><Check size={17} /> Accept</button><button type="button" className="reject-connection" disabled={actingId === item.id} onClick={() => respond(item.id, "rejected")}><X size={17} /> Reject</button></div>} />}</CardGrid>}
          {activeTab === "connections" && <CardGrid items={connections} emptyTitle="No connections yet" emptyText="Discover people and send your first connection request.">{(item) => <PersonCard key={item.id} person={item.person} action={<span className="connected-label"><Check size={16} /> Connected</span>} />}</CardGrid>}
        </>
      )}
    </section>
  );
}

function CardGrid({ items, emptyTitle, emptyText, children }) {
  if (!items.length) return <div className="connections-state empty"><UsersRound size={34} /><h2>{emptyTitle}</h2><p>{emptyText}</p></div>;
  return <div className="connection-grid">{items.map(children)}</div>;
}

function PersonCard({ person, action }) {
  const name = [person.first_name, person.last_name].filter(Boolean).join(" ") || person.startup_name || person.username;
  const initial = name.charAt(0).toUpperCase();
  return <article className="connection-card">
    <div className="connection-card-top">{person.profile_image ? <img className="connection-avatar" src={person.profile_image} alt="" /> : <div className="connection-avatar fallback">{initial}</div>}<div className="connection-identity"><span className={`role-pill role-${person.role}`}>{person.role}</span><h2>{name}</h2><p>@{person.username}</p></div></div>
    <div className="connection-profile"><p className="connection-headline">{person.headline || "SkillBridge member"}</p>{person.organization && <p><Building2 size={15} /> {person.organization}</p>}{person.location && <p><MapPin size={15} /> {person.location}</p>}</div>
    {person.skills?.length > 0 && <div className="connection-skills">{person.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div>}
    <div className="connection-card-action">{action}</div>
  </article>;
}

function DiscoveryAction({ person, busy, onSend }) {
  if (person.relationship_state === "connected") return <span className="connected-label"><Check size={16} /> Connected</span>;
  if (person.relationship_state === "pending") return <span className="pending-label"><Clock3 size={16} /> Pending</span>;
  if (person.relationship_state === "request_received") return <span className="pending-label"><Clock3 size={16} /> Request received</span>;
  return <button type="button" className="send-request-button" disabled={busy} onClick={() => onSend(person)}><UserPlus size={17} /> {busy ? "Sending…" : person.relationship_state === "retry" ? "Retry Request" : "Send Request"}</button>;
}

export default Connections;
