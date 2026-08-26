import { Link } from "react-router-dom";
import { industries, industryShortcuts } from "@/content/industries";
import { featureFigures } from "@/content/features";
import { cn } from "@/lib/cn";
import posthog from "@/lib/posthog";

/* ============================================================================
   INDUSTRY TILES
   ============================================================================
   The nine sectors as a grid of picture-backed buttons, plus a tenth for the
   sector that is not on the list. Lifted out of /industries when the homepage
   close started asking the same question — "where does trust break down in
   your industry?" — because two hand-copied versions of this grid would drift
   apart the first time a sector was added.

   THE CALLER OWNS THE GRID. There are no grid classes in here: /industries
   lays the tiles out five wide across the full page width, the homepage three
   wide in a column beside the copy, and there is no sensible default that
   suits both. It also sidesteps a real trap — cn() joins classes, it does not
   merge them (see lib/cn.ts), so a base `grid-cols-2` and a caller's
   `grid-cols-3` would both survive into the class list and the winner would be
   decided by stylesheet source order rather than by intent.

   `to` decides how a tile navigates. On /industries the targets are on the
   same page, so they are plain fragment links and the browser scrolls. From
   anywhere else they are router links to /industries#id — which relies on the
   hash handling in App.tsx, and specifically on its retry, because the
   industries route is lazy-loaded and its anchors do not exist at the moment
   the location changes.
   ========================================================================= */

/* Which picture a tile shows. It has to be the SAME picture as the card it
   jumps to, or the tile becomes a small lie about what is further down the
   page — so this mirrors IndustryCard's own precedence exactly: the annotated
   figure where one exists, the scene photograph otherwise. Both currently
   resolve for all nine sectors; the fallback is here so adding a sector
   without a figure degrades quietly rather than 404ing. */
function tileThumb(id: string): string | null {
  const figure = featureFigures[id as keyof typeof featureFigures];
  if (figure) return `${figure.image.base}-240.webp`;
  const industry = industries.find((i) => i.id === id);
  return industry?.image ? `/assets/industries/${industry.image}-560.webp` : null;
}

/* Shared so the sector tiles and the contact tile cannot drift apart.
   Reads as a button rather than a table cell.

   The label is centred across the whole tile. An earlier version held it in
   the right two-thirds to keep it clear of the thumbnail, which worked but
   read as text pushed aside by the picture. Centred is the right look, and
   the cost is that the label now sits over a live part of the fade rather
   than past the end of it — see the note beside --tile-thumb-opacity in
   theme.css for the measurements. */
export const shortcutTile = cn(
  /* `relative overflow-hidden` so the sector thumbnail can be absolutely
     positioned inside and is clipped by the rounded corners. */
  "relative overflow-hidden",
  "flex h-full items-center justify-center rounded-md border border-line",
  "bg-tile-surface px-4 py-4 text-center shadow-raised",
  "text-body-sm font-semibold text-ink",
  "transition-colors hover:border-line-strong hover:text-ink-accent",
);

function TileBody({ id, label }: { id: string; label: string }) {
  const thumb = tileThumb(id);
  return (
    <>
      {/* Decorative: the same picture the card below shows, dissolved away
          before it reaches the label. It makes the tile recognisable at a
          glance but carries no information the label does not, so it is
          hidden from assistive technology and has an empty alt. Geometry,
          opacity and mask all live in .tile-thumb in theme.css. */}
      {thumb && (
        <img
          aria-hidden
          alt=""
          src={thumb}
          loading="lazy"
          decoding="async"
          className="tile-thumb"
        />
      )}
      {/* `relative` so it paints above the thumbnail rather than being
          covered by it. */}
      <span className="relative">{label}</span>
    </>
  );
}

export function IndustryTiles({
  to = "anchor",
  className,
  yoursClassName,
  label = "Jump to an industry",
}: {
  /** "anchor" for same-page fragments, "page" for links into /industries. */
  to?: "anchor" | "page";
  /** The grid itself — see the note above about why there is no default. */
  className?: string;
  /** Applied to the tenth tile only, so it can be given a row of its own. */
  yoursClassName?: string;
  label?: string;
}) {
  return (
    <nav aria-label={label}>
      <ul className={className}>
        {industryShortcuts.map((s) => (
          <li key={s.id}>
            {to === "anchor" ? (
              <a
                href={`#${s.id}`}
                className={shortcutTile}
                onClick={() => posthog.capture("industry_selected", {
                  industry: s.id,
                  placement: "industries_page",
                })}
              >
                <TileBody id={s.id} label={s.label} />
              </a>
            ) : (
              <Link
                to={`/industries#${s.id}`}
                className={shortcutTile}
                onClick={() => posthog.capture("industry_selected", {
                  industry: s.id,
                  placement: "home",
                })}
              >
                <TileBody id={s.id} label={s.label} />
              </Link>
            )}
          </li>
        ))}
        {/* Nine sectors in a ten-cell grid leaves a hole, and an empty cell
            reads as a bug. It is also the only tile that converts: a reader
            who does not see themselves in the nine is the one most worth
            hearing from. */}
        <li className={yoursClassName}>
          <Link
            to="/contact"
            className={cn(shortcutTile, "text-ink-accent")}
            onClick={() => posthog.capture("industry_selected", {
              industry: "other",
              placement: to === "anchor" ? "industries_page" : "home",
            })}
          >
            Yours? →
          </Link>
        </li>
      </ul>
    </nav>
  );
}
