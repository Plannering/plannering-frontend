import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const INACTIVITY_TIMEOUT = 6 * 60 * 60 * 1000;

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/login?redirected=admin");
  }, [router]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      console.log("Sessão expirada por inatividade");
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  const setupAuth = useCallback(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        router.push("/login?redirected=admin");
        return;
      }
      try {
        setIsAuthenticated(true);
        resetInactivityTimer();
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

    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    window.addEventListener("storage", handleStorageChange);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      window.removeEventListener("storage", handleStorageChange);

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [resetInactivityTimer, router]);

  return {
    isAuthenticated,
    logout,
    setupAuth,
  };
};
