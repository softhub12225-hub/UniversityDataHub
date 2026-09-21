/**
 * Shown while the search page is being rendered on the server.
 *
 * The page is `force-dynamic` and the catalogue is filtered, sorted and paged
 * server-side, so there is always a round-trip between a click and a result. This is
 * what fills it.
 *
 * WHY IT MIRRORS THE PAGE INSTEAD OF BEING A SPINNER
 * ==================================================
 * A centred spinner throws the layout away and rebuilds it a moment later, so the page
 * arrives as a jolt. Blocking out the masthead, the facet rail and a few result rows
 * at the sizes they will actually occupy means the real content lands in place that is
 * already the right shape, and the eye has somewhere to be in the meantime.
 *
 * It carries no text. Skeleton copy would either be invented -- which is the one thing
 * this product must not do, even decoratively -- or a translation of "loading" the
 * reader cannot act on. The live region in `NavigationProgress` is what announces this
 * to anyone who needs telling.
 */
export default function SearchLoading() {
  return (
    <>
      <section className="pf-masthead" aria-hidden="true">
        <div className="pf-masthead-body">
          <span className="pf-skel pf-skel-title" />
        </div>
        <div className="pf-plate" />
      </section>

      <div className="pf-body" aria-hidden="true">
        <aside className="pf-facets">
          <span className="pf-skel pf-skel-eyebrow" />
          <div className="pf-facet pf-facet-primary">
            <span className="pf-skel pf-skel-legend" />
            <span className="pf-skel pf-skel-row" />
            <span className="pf-skel pf-skel-row" />
          </div>
          <div className="pf-facet">
            <span className="pf-skel pf-skel-legend" />
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <span key={row} className="pf-skel pf-skel-row" />
            ))}
          </div>
        </aside>

        <section className="pf-results">
          <div className="pf-controls">
            <span className="pf-skel pf-skel-scope" />
            <span className="pf-skel pf-skel-tally" />
          </div>
          {/* Five rows: enough to fill the fold at a normal window height without
              pretending to know how many results are coming. */}
          {[0, 1, 2, 3, 4].map((row) => (
            <article key={row} className="pf-result">
              <div className="pf-result-bar" />
              <div className="pf-result-main">
                <span className="pf-skel pf-skel-crest" />
                <div className="pf-result-text">
                  <span className="pf-skel pf-skel-name" />
                  <span className="pf-skel pf-skel-where" />
                  <span className="pf-skel pf-skel-prov" />
                </div>
                <span className="pf-skel pf-skel-btn" />
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
