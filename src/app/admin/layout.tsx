"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SlideBar from "@/core/components/SlideBar/SlideBar";
import { Loader2 } from "lucide-react";
import { BrowserRouter } from "react-router";
import { FiMenu } from "react-icons/fi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        router.push("/login?redirected=admin");
        return;
      }
      try {
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setIsAuthenticated(false);
        router.push("/login?redirected=admin");
      }
    };
    checkAuth();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        router.push("/login?redirected=admin");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  const sidebarWidth = collapsed ? 64 : 240;

  if (isAuthenticated === null) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-sm text-slate-600">Verificando autenticação...</p>
      </div>
    );
  }
  if (isAuthenticated) {
    return (
      <main className="flex h-screen w-full overflow-hidden relative">
        <BrowserRouter>
          <SlideBar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
          <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white shadow z-30 flex items-center px-4">
            <button
              className="text-sky-500 p-2 rounded-full hover:bg-sky-100 transition"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <FiMenu size={24} />
            </button>
            <span className="ml-3 text-sky-600 font-bold text-lg">Plannering</span>
          </header>
          <div
            className={`
              flex-1 overflow-auto p-2 bg-slate-50 transition-all duration-300
              pt-14 md:pt-2
            `}
            style={{
              paddingLeft: mobileOpen ? 0 : undefined,
              marginLeft: !mobileOpen && window.innerWidth >= 768 ? sidebarWidth : 0,
              transition: "margin-left 0.3s, padding-left 0.3s",
            }}
          >
            {children}
          </div>
        </BrowserRouter>
      </main>
    );
  }
  return null;
}
