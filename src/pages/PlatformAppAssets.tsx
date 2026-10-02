import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar, TopBar } from "@/components/renderings/WebDashboard";
import { APP_ASSETS, APP_DEVELOPMENT } from "@/content/app-assets";
import { TowerExplorer } from "@/components/enterprise/TowerExplorer";
import { DevelopmentMap } from "@/components/enterprise/DevelopmentMap";
import { SiteProgress } from "@/components/enterprise/SiteProgress";
import { cn } from "@/lib/cn";

export default function PlatformAppAssets() {
  const { pathname } = useLocation();
  const asset = APP_ASSETS.find((item) => pathname.replace(/\/$/, "") === `/platform/app/assets/${item.id}`);

  return (
    <div data-theme="light" className="h-dvh min-w-[1440px] overflow-hidden bg-surface-sunken text-ink">
      <div className="flex h-full">
        <Sidebar active="Assets" />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          {asset ? (
            <div data-theme="light" className="flex min-h-0 flex-1 flex-col bg-canvas text-ink">
              <div className="flex shrink-0 items-center gap-5 border-b border-line px-6 py-3">
                <Link to="/platform/app/assets" className="text-[13px] text-ink-secondary hover:underline">
                  ← Back to assets
                </Link>
                <h1 className="text-[16px] font-semibold">{asset.name}</h1>
              </div>
              <div className="min-h-0 flex-1">
                {/* ⚠️  THE ASSET'S OWN TOWER. This passed TOWERS[0] whichever
                    asset was opened, so all three showed the same building and
                    none of them matched the unit count on the marker that
                    opened it. */}
                <TowerExplorer
                  key={asset.id}
                  showHeader={false}
                  initialTower={asset.tower}
                />
              </div>
            </div>
          ) : (
            <AssetsMap />
          )}
        </div>
      </div>
    </div>
  );
}

/* Two readings of one development: where the towers are, and how much of the
   work inside them is captured. A toggle rather than two routes — they answer
   the same question from different ends and a reader flips between them. */
function AssetsMap() {
  const [view, setView] = useState<"map" | "progress">("map");

  return (
    <section aria-label="Assets" className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-4 border-b border-line bg-surface px-6 py-3">
        <div>
          <h1 className="text-[16px] font-semibold">{APP_DEVELOPMENT.name}</h1>
          <p className="text-[12px] text-ink-secondary">
            {APP_DEVELOPMENT.towers} towers · {APP_DEVELOPMENT.units} apartments
            · {APP_DEVELOPMENT.place}
          </p>
        </div>

        <div className="ml-auto flex rounded-md border border-line">
          {(
            [
              ["map", "Map"],
              ["progress", "Capture progress"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-pressed={view === key}
              className={cn(
                "cursor-pointer px-3 py-1.5 text-[13px] transition-colors",
                view === key
                  ? "bg-surface-sunken font-medium text-ink"
                  : "text-ink-secondary hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "map" ? (
        <div className="relative min-h-0 flex-1">
          <DevelopmentMap />

          {/* Every tower as a row. A marker you have to find on a map is not a
              list of your assets, and keyboard users never reach one. */}
          <ul className="absolute left-4 top-4 z-[500] flex w-60 flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-raised">
            {APP_ASSETS.map((asset) => (
              <li key={asset.id} className="border-b border-line last:border-b-0">
                <Link
                  to={`/platform/app/assets/${asset.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-sunken"
                >
                  <img
                    src={asset.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">
                      {asset.name}
                    </span>
                    <span className="block truncate text-[11px] text-ink-secondary">
                      {asset.floors} floors · {asset.units} apartments
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <SiteProgress />
        </div>
      )}
    </section>
  );
}
