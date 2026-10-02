import { WebDashboard } from "@/components/renderings/WebDashboard";

export default function PlatformApp() {
  return (
    <div className="h-dvh w-full overflow-x-auto">
      <div className="h-full min-w-[1440px]">
        <WebDashboard autoScroll={false} />
      </div>
    </div>
  );
}
