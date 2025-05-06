import React from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SlideBarItemProps = {
  title: string;
  icon: React.ReactNode;
  link: string;
  collapsed?: boolean;
  onClick?: () => void;
  badge?: number;
};

export default function SlideBarItem({ title, icon, link, collapsed = false, onClick, badge }: SlideBarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === link;

  const button = (
    <button
      onClick={onClick}
      className={clsx(
        "group relative flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 outline-none border-none w-full",
        isActive ? "bg-sky-500 text-white shadow-lg" : "text-gray-500 hover:bg-sky-100 hover:text-sky-600",
        collapsed ? "justify-center px-2" : "justify-start",
      )}
      style={{ minHeight: 48 }}
    >
      <span
        className={clsx("text-2xl transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")}
      >
        {icon}
      </span>
      {!collapsed && (
        <span
          className={clsx(
            "font-semibold text-base transition-colors duration-200",
            isActive ? "text-white" : "text-gray-500 group-hover:text-sky-600",
          )}
        >
          {title}
        </span>
      )}
      {badge && !collapsed && (
        <span className="ml-auto bg-sky-100 text-sky-600 text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
      {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-white/80 shadow-md" />}
    </button>
  );

  // Tooltip só quando colapsado
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="select-none">
            {title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
