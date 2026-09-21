/**
 * Shown while an institution dossier is being rendered on the server.
 *
 * Its own file rather than inheriting the search page's skeleton: this route has a
 * different shape -- a crest and a long heading over two unequal columns -- and a
 * skeleton that blocks out the wrong layout is worse than none, because it moves
 * everything twice instead of once.
 */
export default function DossierLoading() {
  return (
    <>
      <section className="pf-masthead" aria-hidden="true">
        <div className="pf-masthead-body">
          <span className="pf-skel pf-skel-back" />
          <div className="pf-skel-lockup">
            <span className="pf-skel pf-skel-crest-lg" />
            <div className="pf-skel-lockup-text">
              <span className="pf-skel pf-skel-title" />
              <span className="pf-skel pf-skel-where" />
            </div>
          </div>
        </div>
        <div className="pf-plate" />
      </section>

      <div className="pf-doc" aria-hidden="true">
        <div className="pf-doc-main">
          <section>
            <span className="pf-skel pf-skel-legend" />
            <div className="pf-facts">
              {[0, 1, 2].map((card) => (
                <div key={card} className="pf-fact">
                  <span className="pf-skel pf-skel-eyebrow" />
                  <span className="pf-skel pf-skel-value" />
                  <span className="pf-skel pf-skel-prov" />
                </div>
              ))}
            </div>
          </section>
          <section>
            <span className="pf-skel pf-skel-legend" />
            {[0, 1, 2].map((row) => (
              <span key={row} className="pf-skel pf-skel-row" />
            ))}
          </section>
        </div>

        <aside className="pf-doc-rail">
          <div className="pf-rail-card">
            <span className="pf-skel pf-skel-eyebrow pf-skel-on-dark" />
            {[0, 1, 2].map((row) => (
              <span key={row} className="pf-skel pf-skel-row pf-skel-on-dark" />
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
