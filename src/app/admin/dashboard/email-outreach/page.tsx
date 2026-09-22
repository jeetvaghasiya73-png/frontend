"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_PATH } from "@/lib/config";

export default function EmailOutreachAliasPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`${ADMIN_PATH}/dashboard/automation/whatsapp`);
  }, [router]);

  return null;
}
