import { GlobalRail } from "@/components/nav/GlobalRail";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh">
      <GlobalRail email={user?.email ?? ""} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
