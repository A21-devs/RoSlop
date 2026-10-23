import { Component, type ReactNode } from "react";

// One broken page shouldn't take the whole app down with it.
export class Crash extends Component<{ children: ReactNode; full?: boolean }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className={this.props.full ? "login" : "content"}>
        <div className="card pad col" style={{ maxWidth: 520, gap: 10 }}>
          <b>This page hit a snag</b>
          <div className="muted">Your stuff is safe, nothing was lost. Reloading usually fixes it.</div>
          <code className="mono dim" style={{ whiteSpace: "pre-wrap" }}>{error.message}</code>
          <div className="row">
            <button className="btn pri" onClick={() => location.reload()}>Reload</button>
            <button className="btn ghost" onClick={() => this.setState({ error: null })}>Try this page again</button>
          </div>
        </div>
      </div>
    );
  }
}
