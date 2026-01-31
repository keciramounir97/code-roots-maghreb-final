import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import Breadcrumb from "./components/Breadcrumb";

export default function AdminLayout() {
  const [open, setOpen] = useState(true);

  return (
    <div className="admin-shell min-h-screen">
      <AdminHeader sidebarOpen={open} onToggleSidebar={() => setOpen((v) => !v)} />
      <AdminSidebar open={open} onClose={() => setOpen(false)} onToggle={() => setOpen((v) => !v)} />
      <main
        className={`transition-all duration-300 pt-20 pb-10 px-4 sm:px-6 ${
          open ? "lg:pl-72" : ""
        }`}
      >
        <div className="admin-panel max-w-7xl mx-auto">
          <div className="admin-panel-shell rounded-xl">
            <Breadcrumb />
            <Outlet context={{ sidebarOpen: open }} />
          </div>
        </div>
      </main>
    </div>
  );
}
