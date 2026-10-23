import { Component, type ErrorInfo, type ReactNode } from "react";

// One broken page shouldn't take the whole app down with it.
export class Crash extends Component<{ children: ReactNode; full?: boolean; quiet?: boolean }, { error: Error | null; where: string }> {
  state = { error: null as Error | null, where: "" };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
    // First few component names, enough to tell which part of the screen broke.
    const where = (info.componentStack ?? "").split("\n").map(l => l.trim().match(/^at (\w+)/)?.[1]).filter(Boolean).slice(0, 3).join(" < ");
    this.setState({ where });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.quiet) return null;
    return (
      <div className={this.props.full ? "login" : "content"}>
        <div className="card pad col" style={{ maxWidth: 520, gap: 10 }}>
          <b>This page hit a snag</b>
          <div className="muted">Your stuff is safe, nothing was lost. Reloading usually fixes it.</div>
          <code className="mono dim" style={{ whiteSpace: "pre-wrap", userSelect: "text" }}>{error.message}{this.state.where ? `\nin ${this.state.where}` : ""}</code>
          <div className="row">
            <button className="btn pri" onClick={() => location.reload()}>Reload</button>
            <button className="btn ghost" onClick={() => this.setState({ error: null })}>Try this page again</button>
          </div>
        </div>
      </div>
    );
  }
}
