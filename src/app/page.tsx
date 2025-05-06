"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Homepage() {
  const router = useRouter();

  // Using useEffect to handle client-side navigation after component mounts

  useEffect(() => {
    router.push("/landing");
  }, [router]);

  return null;
}
