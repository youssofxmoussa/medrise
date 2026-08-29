import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TabBar } from "@/components/ios/TabBar";
import { useStudyTimer } from "@/lib/activity";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  useStudyTimer();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div className="mx-auto w-full max-w-md px-5 safe-top flex-1 flex flex-col">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
