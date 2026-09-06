export default function NotFound() {
  return (
    <main className="wrap section">
      <p className="eyebrow">404 / Page not found</p>
      <h1>
        This path is
        <br />
        still unexplored.
      </h1>
      <p>The page may have moved, or the link may be incomplete.</p>
      <a href="/" className="button primary">
        Return to the portfolio ↗
      </a>
    </main>
  );
}
