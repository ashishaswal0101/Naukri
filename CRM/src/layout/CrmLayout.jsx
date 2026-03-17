import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CrmHeader from "../components/CrmHeader";
import CrmSidebar from "../components/CrmSidebar";

export default function CrmLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <CrmSidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      <div className="md:pl-72">
        <CrmHeader toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
