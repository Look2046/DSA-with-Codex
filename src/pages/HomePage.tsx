import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <p className="eyebrow">V1 Learning Studio</p>
        <h2>Learn Core DSA Concepts Through Step-by-Step Visual Playback</h2>
        <p className="hero-copy">
          Start from foundational modules and move to algorithmic thinking with timeline-based
          interaction.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/modules">
            Browse Modules
          </Link>
          <Link className="btn btn-secondary" to="/modules/sorting">
            View Sorting Overview
          </Link>
        </div>
      </section>

      <section className="card-grid">
        <article className="feature-card">
          <h3>P0 Modules</h3>
          <p>S-01 Bubble Sort, L-01 Array, and L-03 Linked List are prioritized for V1.</p>
        </article>
        <article className="feature-card">
          <h3>Interaction Model</h3>
          <p>Play, pause, step, and reset controls with deterministic animation steps.</p>
        </article>
        <article className="feature-card">
          <h3>Engineering Workflow</h3>
          <p>Branch-based delivery, quality gates, and daily handoff documentation.</p>
        </article>
      </section>

      <section className="milestone">
        <h3>Current Milestone</h3>
        <p>M0 Scaffold is active: route shell and placeholder pages are ready for iteration.</p>
      </section>
    </div>
  );
}
