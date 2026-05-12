import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ProfileView } from "@/components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <div
      className="grid min-h-screen"
      style={{ gridTemplateColumns: "var(--width-sidebar) 1fr" }}
    >
      <Sidebar
        active="profile"
        user={{ initials: "AM", name: "Amelia M.", meta: "Year 2 · Makerere" }}
      />
      <main
        className="min-w-0"
        style={{
          paddingInline: "var(--page-px)",
          paddingTop: "var(--page-pt)",
          paddingBottom: "var(--page-pb)",
        }}
      >
        <Topbar />
        <ProfileView />
      </main>
    </div>
  );
}
