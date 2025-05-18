"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {useAuth} from "@/components/providers/auth-provider";

export function useRequireAdmin() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!user || user.role !== "admin") {
      router.replace("/");
    } else {
      setChecked(true);
    }
  }, [isLoadingAuth, user, router]);

  return { loading: isLoadingAuth || !checked };
}