import React, { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../services/auth/auth-context";

export default function UserLayout() {
  const auth = useContext(AuthContext);
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="p-6 text-xl font-bold border-b">
            DOCTOR PANEL
          </div>

          {/* Navigation */}
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              to="/user/example1"
              className="px-4 py-2 rounded-lg hover:bg-blue-100 transition"
            >
              Example1
            </Link>

            <Link
              to="/user/example2"
              className="px-4 py-2 rounded-lg hover:bg-blue-100 transition"
            >
              Example2
            </Link>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={() => {
              auth.logout();
              nav("/login");
            }}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
