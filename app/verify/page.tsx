"use client";

import { VerifyEmailPage } from "@/components/VerifyEmailPage";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-orange-50">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      }
    >
      <VerifyEmailPage />
    </Suspense>
  );
}