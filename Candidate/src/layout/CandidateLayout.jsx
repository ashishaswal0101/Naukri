import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CandidateHeader from "../components/CandidateHeader";
import CandidateSidebar from "../components/CandidateSidebar";

export default function CandidateLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSidebarOpen(false), 0);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div ref={sidebarRef}>
        <CandidateSidebar
          isOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="md:pl-72">
        <CandidateHeader
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
