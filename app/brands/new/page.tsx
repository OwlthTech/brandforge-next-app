"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/common";

export default function NewBrandPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to onboarding page for new brand creation with return parameter
    router.replace("/onboarding?returnTo=brands");
  }, [router]);

  return <LoadingState message="Redirecting to brand setup..." />;
}
