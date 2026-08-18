import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://skillbridge-frontend-jkgi.onrender.com";
const DEFAULT_DESCRIPTION = "SkillBridge connects students, mentors, and recruiters or startups through career opportunities, mentorship, learning, applications, and professional connections.";
const PUBLIC_META = {
  "/": { title: "SkillBridge — Career Opportunities, Mentorship & Professional Connections", description: DEFAULT_DESCRIPTION, index: true },
  "/login": { title: "Sign In | SkillBridge", description: "Sign in to SkillBridge to access opportunities, learning, applications, mentorship, and professional connections.", index: true },
  "/register": { title: "Create an Account | SkillBridge", description: "Create a SkillBridge account as a student, mentor, or recruiter or startup and start building professional connections.", index: true },
};

function setMeta(selector, attribute, value) {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function SeoMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = PUBLIC_META[pathname] || { title: "SkillBridge", description: DEFAULT_DESCRIPTION, index: false };
    const canonicalUrl = `${SITE_URL}${PUBLIC_META[pathname] ? pathname : "/"}`;
    document.title = meta.title;
    setMeta('meta[name="description"]', "content", meta.description);
    setMeta('meta[name="robots"]', "content", meta.index ? "index, follow" : "noindex, nofollow");
    setMeta('link[rel="canonical"]', "href", canonicalUrl);
    setMeta('meta[property="og:title"]', "content", meta.title);
    setMeta('meta[property="og:description"]', "content", meta.description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "content", meta.title);
    setMeta('meta[name="twitter:description"]', "content", meta.description);
  }, [pathname]);

  return null;
}
