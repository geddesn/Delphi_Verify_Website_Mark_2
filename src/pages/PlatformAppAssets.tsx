import { Link, useLocation } from "react-router-dom";
import { Sidebar, TopBar } from "@/components/renderings/WebDashboard";
import { APP_ASSETS, APP_DEVELOPMENT } from "@/content/app-assets";
import { TowerExplorer } from "@/components/enterprise/TowerExplorer";
import { DevelopmentMap } from "@/components/enterprise/DevelopmentMap";

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

function AssetsMap() {
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
      </div>

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
    </section>
  );
}
