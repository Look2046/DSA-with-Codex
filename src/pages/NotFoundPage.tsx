import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section>
      <h2>404</h2>
      <p>Page not found.</p>
      <Link to="/">Back to Home</Link>
    </section>
  );
}
