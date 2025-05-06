import React, { useState, useEffect, useRef } from "react";
import { FiLogOut, FiUser, FiSettings } from "react-icons/fi";
import { getUser } from "@/core/utils/getUser";
import { handleLogout } from "@/core/utils/logoutUser";

interface SlideBarUserProps {
  collapsed?: boolean;
}

export default function SlideBarUser({ collapsed = false }: SlideBarUserProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  if (isMobile) {
    return (
      <div className="w-full flex flex-col items-center py-6">
        <div className="relative w-full">
          <button
            ref={buttonRef}
            className="flex items-center justify-center gap-3 p-2 rounded-2xl bg-white w-[14rem] mx-auto shadow-md text-start hover:bg-sky-50 transition border border-slate-200"
            aria-label="Abrir menu do usuário"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-sky-300 flex items-center justify-center ring-2 ring-sky-400/60 shadow overflow-hidden">
              <FiUser size={22} className="text-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <span className="font-semibold text-slate-700 transition-all duration-200 block truncate">
                {getUser.name}
              </span>
              <span className="text-xs text-slate-500 block truncate">{getUser.email}</span>
            </div>
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 left-0 mx-auto mt-2 w-[14rem] bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-fade-in"
            >
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-sky-300 flex items-center justify-center ring-2 ring-sky-400/40 overflow-hidden">
                    <FiUser size={24} className="text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{getUser.name}</span>
                    <span className="text-xs text-slate-500">{getUser.email}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-2"></div>

              <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-sky-50 text-slate-700 transition text-sm">
                <FiSettings size={18} className="text-sky-500" />
                Configurações
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-red-600 transition text-sm"
                onClick={handleLogout}
              >
                <FiLogOut size={18} />
                Desconectar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className={`flex items-center ${
          collapsed ? "justify-center w-full" : "gap-3"
        } p-2 rounded-2xl bg-white w-[14rem] mt-4 shadow-md text-start hover:bg-sky-50 transition border border-slate-200 `}
        aria-label="Abrir menu do usuário"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
      >
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-sky-300 flex items-center justify-center ring-2 ring-sky-400/60 shadow overflow-hidden">
          <FiUser size={22} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <span className="font-semibold text-slate-700 transition-all duration-200 block truncate">
              {getUser.name}
            </span>
            <span className="text-xs text-slate-500 block truncate">{getUser.email}</span>
          </div>
        )}
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          className={` ${
            collapsed ? "right-0 top-0 left-16" : "right-0  left-0"
          } absolute mt-2 w-[14rem] bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-fade-in`}
        >
          {collapsed && (
            <>
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-sky-300 flex items-center justify-center ring-2 ring-sky-400/40 overflow-hidden">
                    <FiUser size={24} className="text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">{getUser.name}</span>
                    <span className="text-xs text-slate-500">{getUser.email}</span>
                  </div>
                </div>
              </div>
              <div className="h-px bg-slate-100 my-2"></div>
            </>
          )}
          <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-sky-50 text-slate-700 transition text-sm">
            <FiSettings size={18} className="text-sky-500" />
            Configurações
          </button>

          <div className="h-px bg-slate-100 my-1"></div>

          <button
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-red-600 transition text-sm"
            onClick={handleLogout}
          >
            <FiLogOut size={18} />
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}
