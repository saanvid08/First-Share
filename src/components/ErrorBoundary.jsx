import { Component } from 'react';

// If one screen fails, show a message and a way out instead of a blank page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="card">
        <h2>This screen could not load</h2>
        <p className="muted">Something in your saved data does not match this version of the app. Your other progress is safe.</p>
        <p className="small muted">Details: {String(this.state.error.message || this.state.error)}</p>
        <div className="row">
          <button className="btn primary" onClick={() => this.setState({ error: null })}>Try again</button>
          <button className="btn danger" onClick={this.props.onReset}>Reset all progress</button>
        </div>
      </section>
    );
  }
}
