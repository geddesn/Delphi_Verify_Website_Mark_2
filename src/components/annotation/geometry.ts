/* ============================================================================
   ANNOTATION GEOMETRY — where a box sits and where its connector leaves from
   ============================================================================
   Shared by every annotated surface on the site: the industry figures, their
   expanded dialogs, and the trust engine stage. One set of rules, so a leader
   drawn over a photograph and a leader drawn over the stage are the same
   object rather than two implementations that drift apart.

   COORDINATES
   Every value is a percentage of the CONTAINER box, origin top-left. Not of
   the image file — which is what makes an annotation impossible to crop off,
   and what lets the same numbers survive a change of source image.

     anchor : the dot, on the thing being pointed at
     panel  : the box, positioned by its `align` corner
     box    : the box's footprint, used only to find the connector's start

   `align` names which part of the box sits at `panel`, so a box on the right
   of the frame is anchored by its right edge and can never overflow. It reads
   vertical-then-horizontal — "top-left", "bottom-center", "middle-right".

   THE CONNECTOR
   Drawn from the box's edge to the anchor. Which edge is inferred from the
   relative position of the two points, which is right almost always; `from`
   forces it for the cases where it is not, and `fromPoint` overrides the
   geometry entirely for a box whose real shape this module cannot know.
   ========================================================================= */

export type Point = { x: number; y: number };

export type VAlign = "top" | "middle" | "bottom";
export type HAlign = "left" | "center" | "right";
export type Align = `${VAlign}-${HAlign}`;

export type Side = "top" | "bottom" | "left" | "right";

/** Panel footprint as a share of the container. */
export type Box = { w: number; h: number };

/** A measured panel: where it actually landed, as a share of the container.
 *  Position as well as size, because a panel positioned by a flex column has
 *  no authored coordinates to fall back on — the layout decides, and the
 *  leader has to ask it where the answer came out. */
export type Rect = { x: number; y: number; w: number; h: number };

export type AnnotationSpec = {
  id: string;
  /** The dot, on the asset. */
  anchor: Point;
  /** The box, positioned by `align`. Optional: a panel laid out by a flex
   *  column has no authored position, and its rect is measured instead. Give
   *  one anyway where you can — it is what the server renders with, before
   *  any measurement has happened. */
  panel?: Point;
  /** Which part of the box sits at `panel`. Default "top-left". */
  align?: Align;
  /** Force the connector's departure edge. Default: inferred. */
  from?: Side;
  /** Bypass the geometry and start the connector exactly here. */
  fromPoint?: Point;
  /** Footprint, % of container. Default DEFAULT_BOX. */
  box?: Box;
};

/* Approximate on purpose: the line meets the box's edge, and a few tenths of
   a percent is invisible. Only worth tuning when a panel's width class changes
   materially — or pass `box` on the spec for a panel that is a different size,
   which is why it is a per-spec value and not only a constant. */
export const DEFAULT_BOX: Box = { w: 21, h: 17 };

export function splitAlign(align: Align = "top-left"): [VAlign, HAlign] {
  const [v, h] = align.split("-") as [VAlign, HAlign];
  return [v, h];
}

/** The box's edges in container %.
 *
 *  A measured rect always wins: it is where the panel really is, transforms
 *  and flex centring included. The authored position is the fallback for the
 *  server render and the first paint, before anything has been measured. */
export function boxRect(spec: AnnotationSpec, measured?: Rect) {
  if (measured) {
    const { x, y, w, h } = measured;
    return { left: x, top: y, w, h, cx: x + w / 2, cy: y + h / 2 };
  }

  const { w, h } = spec.box ?? DEFAULT_BOX;
  const origin = spec.panel ?? spec.anchor;
  const [v, hAlign] = splitAlign(spec.align);
  const left =
    hAlign === "left" ? origin.x : hAlign === "center" ? origin.x - w / 2 : origin.x - w;
  const top = v === "top" ? origin.y : v === "middle" ? origin.y - h / 2 : origin.y - h;
  return { left, top, w, h, cx: left + w / 2, cy: top + h / 2 };
}

/** Where the connector leaves the box, in container %. */
export function departurePoint(spec: AnnotationSpec, measured?: Rect): Point {
  if (spec.fromPoint) return spec.fromPoint;

  const { left, top, w, h, cx, cy } = boxRect(spec, measured);
  const side =
    spec.from ??
    (Math.abs(spec.anchor.y - cy) >= Math.abs(spec.anchor.x - cx)
      ? spec.anchor.y > cy
        ? "bottom"
        : "top"
      : spec.anchor.x > cx
        ? "right"
        : "left");

  switch (side) {
    case "top":
      return { x: cx, y: top };
    case "bottom":
      return { x: cx, y: top + h };
    case "left":
      return { x: left, y: cy };
    default:
      return { x: left + w, y: cy };
  }
}

/** Transform classes that pull the box back onto its `align` corner. */
export function alignClasses(align: Align = "top-left"): string {
  const [v, h] = splitAlign(align);
  return [
    h === "center" ? "-translate-x-1/2" : h === "right" ? "-translate-x-full" : "",
    v === "middle" ? "-translate-y-1/2" : v === "bottom" ? "-translate-y-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
