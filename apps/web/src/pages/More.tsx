import { Link } from "react-router-dom";
import { Icon, type IconName } from "../ui/bits";

const LINKS: [string, IconName, string][] = [
  ["/team", "team", "Team"], ["/coach", "coach", "Prompt coach"], ["/games", "games", "Games"], ["/pitches", "pitches", "Pitches"],
  ["/market", "market", "Market"], ["/library", "library", "Library"], ["/vault", "vault", "Vault"], ["/settings", "settings", "Settings"],
];

export function More() {
  return (
    <div className="content">
      <div className="muted small" style={{ marginBottom: 12 }}>This phone is a remote. The crew runs on your computer.</div>
      <div className="card list">
        {LINKS.map(([to, icon, label]) => (
          <Link key={to} to={to} className="row" style={{ padding: "14px 16px", gap: 12, fontSize: 15 }}>
            <Icon name={icon} size={18} /><span className="grow">{label}</span><Icon name="right" style={{ color: "var(--dim)" }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
