import { Sidebar, TopBar } from "@/components/renderings/WebDashboard";

/* ============================================================================
   APP SHELL
   ============================================================================
   The chrome every screen of the app demo sits in.

   Lifted out of PlatformAppSection because the home page needs it too, and a
   page importing a component out of another page is how two copies of a layout
   start drifting apart. The sidebar and top bar still come from the marketing
   rendering, deliberately: the app demo and the picture of the app on
   /platform/renderings must not diverge.
   ========================================================================= */

export function AppShell({
  active,
  title,
  eyebrow,
  standfirst,
  children,
}: {
  active: string;
  title: string;
  eyebrow: string;
  standfirst?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="light"
      className="h-dvh min-w-[1440px] overflow-hidden bg-surface-sunken text-ink"
    >
      <div className="flex h-full">
        <Sidebar active={active} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          {/* Only the working area scrolls. A sidebar and a search bar that
              scroll away are not a sidebar and a search bar. */}
          <main className="flex-1 overflow-y-auto px-10 py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-[26px] font-semibold">{title}</h1>
            {standfirst && (
              <p className="mt-2 text-[13px] text-ink-secondary">{standfirst}</p>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
