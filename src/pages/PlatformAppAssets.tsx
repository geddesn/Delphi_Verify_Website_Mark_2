import { Link, useLocation } from "react-router-dom";
import { Sidebar, TopBar } from "@/components/renderings/WebDashboard";
import { APP_ASSETS } from "@/content/app-assets";
import { cn } from "@/lib/cn";
import { TowerExplorer } from "@/components/enterprise/TowerExplorer";
import { TOWERS } from "@/content/enterprise/world";

export default function PlatformAppAssets() {
  const { pathname } = useLocation();
  const asset = APP_ASSETS.find((item) => pathname.replace(/\/$/, "") === `/platform/app/assets/${item.id}`);

  return (
    <div data-theme="light" className="h-dvh min-w-[1440px] overflow-hidden bg-surface-sunken text-ink">
      <div className="flex h-full">
        <Sidebar active="Assets" />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          {asset?.kind === "building" ? (
            <div data-theme="light" className="flex min-h-0 flex-1 flex-col bg-canvas text-ink">
              <div className="flex shrink-0 items-center gap-5 border-b border-line px-6 py-3">
                <Link to="/platform/app/assets" className="text-[13px] text-ink-secondary hover:underline">
                  ← Back to assets
                </Link>
                <h1 className="text-[16px] font-semibold">{asset.name}</h1>
              </div>
              <div className="min-h-0 flex-1">
                <TowerExplorer key={asset.id} showHeader={false} initialTower={TOWERS[0]} />
              </div>
            </div>
          ) : asset ? (
            <div className="flex-1 overflow-y-auto px-10 py-8">
              <Link to="/platform/app/assets" className="text-[13px] text-ink-accent hover:underline">
                ← Back to assets
              </Link>
              <h1 className="mt-5 text-[26px] font-semibold">{asset.name}</h1>
            </div>
          ) : (
            <AssetsMap />
          )}
        </div>
      </div>
    </div>
  );
}

function AssetsMap() {
  return (
    <section aria-label="Asset locations" className="relative min-h-0 flex-1 overflow-hidden">
      <img src="/assets/maps/demo-london.jpg" alt="" className="absolute inset-0 h-full w-full" />

      <div className="absolute left-0 top-0 z-10 rounded-br-xl border-b border-r border-line bg-surface px-6 py-4 shadow-raised">
        <h1 className="text-[18px] font-semibold">Assets</h1>
        <p className="mt-0.5 text-[12px] text-ink-secondary">{APP_ASSETS.length} assets · {APP_ASSETS.filter((asset) => asset.kind === "building").length} buildings · London</p>
      </div>

      {APP_ASSETS.map((asset) => (
        <Link
          key={asset.id}
          to={`/platform/app/assets/${asset.id}`}
          aria-label={`Open ${asset.name}`}
          title={asset.name}
          className="group absolute z-10 -translate-x-1/2 -translate-y-full rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          style={{ left: `${asset.x}%`, top: `${asset.y}%` }}
        >
          <span className="relative block transition-transform duration-150 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
            <span aria-hidden className="absolute -bottom-2 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-surface shadow-raised" />
            <img
              src={asset.image}
              alt=""
              className="relative h-[84px] w-[84px] rounded-full border-[5px] border-surface object-cover shadow-raised group-hover:ring-2 group-hover:ring-accent"
            />
            {asset.kind === "building" && (
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-accent text-accent-ink" aria-hidden>
                <BuildingIcon />
              </span>
            )}
          </span>
          <span className={cn(
            "absolute left-1/2 top-full mt-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface px-3 py-1.5 text-[12px] font-semibold shadow-raised transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
            asset.kind === "building" ? "opacity-100" : "opacity-0",
          )}>
            {asset.name}
            {asset.kind === "building" && (
              <span className="mt-0.5 block text-[11px] font-normal text-ink-secondary">Building · {asset.units} units</span>
            )}
          </span>
        </Link>
      ))}

    </section>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 18V3h10v15M3 18h14M8 6h1m2 0h1M8 9h1m2 0h1M8 12h1m2 0h1M9 18v-3h2v3" />
    </svg>
  );
}
