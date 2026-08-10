import "./BrandLogo.css";

function BrandIcon({ tone = "dark", title }) {
  const bridgeColor = tone === "light" ? "#f6f2ed" : "#2f2d2a";

  return (
    <svg
      className="skillbridge-symbol"
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
    >
      <path d="M18 14.5 32 8l14 6.5L32 21z" fill="#cdb79e" />
      <path d="M43.5 16.2v8" stroke="#a88a6b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="43.5" cy="26.5" r="2" fill="#a88a6b" />
      <circle cx="20" cy="28.5" r="4.5" fill="#cdb79e" />
      <circle cx="44" cy="28.5" r="4.5" fill="#a88a6b" />
      <path
        d="M10 51c2.6-13.2 10.2-20 22-20s19.4 6.8 22 20M14 51h36M19 51V41m26 10V41"
        fill="none"
        stroke={bridgeColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BrandLogo({
  variant = "full",
  tone = "dark",
  className = "",
  label = "SkillBridge",
}) {
  const classes = ["skillbridge-logo", `skillbridge-logo--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  if (variant === "icon") {
    return (
      <span className={classes}>
        <BrandIcon tone={tone} title={label} />
      </span>
    );
  }

  return (
    <div className={classes} aria-label={label}>
      <BrandIcon tone={tone} />
      <span className="skillbridge-wordmark">
        <span>Skill</span>Bridge
      </span>
    </div>
  );
}
