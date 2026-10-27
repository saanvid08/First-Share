export default function Welcome({ onStart }) {
  return (
    <main className="welcome">
      <div className="welcome-inner">
        <p className="eyebrow">First Share</p>
        <h1>Learn how investing works before you invest.</h1>
        <p className="lead">
          Make decisions in fictional situations, see what happens, and learn the ideas behind the outcome.
          Everything here uses fictional companies and prices.
        </p>
        <ol className="steps">
          <li><strong>Learn</strong> the basics in short, hands-on lessons.</li>
          <li><strong>Simulate</strong> a first paycheck and a virtual market.</li>
          <li><strong>Compare</strong> how starting early changes an outcome.</li>
        </ol>
        <button className="btn primary large" onClick={onStart}>Start learning</button>
        <p className="muted small">This is educational only. It is not investment advice.</p>
      </div>
    </main>
  );
}
