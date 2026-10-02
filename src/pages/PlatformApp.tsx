import { AppShell } from "@/components/enterprise/AppShell";
import { AppHome } from "@/components/enterprise/AppHome";
import { ORG } from "@/content/dashboard";

/* ⚠️  THE LONDON DASHBOARD IS GONE. This rendered WebDashboard — the agency
   demo behind /platform/renderings, with its five invented London addresses,
   "Evidence operations · London Residential", a yacht and a villa in the
   Maldives — as the home page of an app whose every other screen is about a
   development in Jamundí. WebDashboard still stands, because the marketing
   page it was built for is where it belongs.

   See the warnings at the top of AppHome for what replaced it. */
export default function PlatformApp() {
  return (
    <div className="h-dvh w-full overflow-x-auto">
      <div className="h-full min-w-[1440px]">
        <AppShell
          active="Home"
          title="Today"
          eyebrow={ORG.workspace}
          standfirst="Where the development is, what needs you, and what has just come in."
        >
          <AppHome />
        </AppShell>
      </div>
    </div>
  );
}
