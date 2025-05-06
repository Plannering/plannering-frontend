import React, { useEffect, useState } from "react";
import SlideBarItem from "./SlideBarItem";
import {
  FiHome,
  FiMenu,
  FiCalendar,
  FiSettings,
  FiTrendingUp,
  FiBook,
  FiCheckSquare,
  FiFileText,
  FiClipboard,
  FiX,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import SlideBarUser from "./SlideBarUser";

const items = [
  { title: "Dashboard", icon: <FiHome />, link: "/admin/dashboard" },
  { title: "Tarefas", icon: <FiCheckSquare />, link: "/admin/tarefas" },
  { title: "Atividades", icon: <FiClipboard />, link: "/admin/atividades" },
  { title: "Provas", icon: <FiFileText />, link: "/admin/provas" },
  { title: "Matérias", icon: <FiBook />, link: "/admin/materias" },
  { title: "Calendário", icon: <FiCalendar />, link: "/admin/calendario" },
  { title: "Progresso", icon: <FiTrendingUp />, link: "/admin/progresso" },
  { title: "Configurações", icon: <FiSettings />, link: "/admin/configuracoes" },
];

type SlideBarProps = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

export default function SlideBar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SlideBarProps) {
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen, setMobileOpen]);

  const sidebarCollapsed = isMobile ? false : collapsed;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-2xl z-40
          flex flex-col transition-all duration-300 ease-in-out
          border-r border-gray-100
          ${sidebarCollapsed ? "w-16 px-1" : "w-60 px-2"}
          ${isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
        style={{ minHeight: "100vh" }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!sidebarCollapsed && (
            <span className="text-sky-500 font-extrabold text-xl tracking-tight select-none">Plannering</span>
          )}

          {/* Botão de fechar no mobile / Botão de colapso no desktop */}
          <button
            className="text-gray-400 hover:text-sky-500 transition"
            onClick={() => (isMobile ? setMobileOpen(false) : setCollapsed(!collapsed))}
            aria-label={isMobile ? "Fechar menu" : "Colapsar menu"}
          >
            {isMobile ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        <div className="flex w-full ">
          <SlideBarUser collapsed={sidebarCollapsed} />
        </div>

        <nav className="flex-1 flex flex-col gap-2 mt-4">
          {items.map((item) => (
            <SlideBarItem
              key={item.link}
              {...item}
              collapsed={sidebarCollapsed}
              onClick={() => {
                router.push(item.link);
                if (isMobile) setMobileOpen(false);
              }}
            />
          ))}
        </nav>

        {/* Footer opcional */}
        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          {!sidebarCollapsed && "© 2025 Planner"}
        </div>
      </aside>

      {/* Overlay para mobile */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-30 transition" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
