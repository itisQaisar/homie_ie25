"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";

export function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setResent(true);
      } catch (error) {
        console.error("Error resending", error);
      }
    }
  };

  const handleBackToLogin = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-50 rounded-full">
            <Mail className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
        <p className="text-gray-600 mb-6">
          We sent a link to <strong>{email}</strong>. Please click it to activate your account.
        </p>

        <Button onClick={handleBackToLogin} className="w-full mb-4">
          Return to Login
        </Button>

        <button 
          onClick={handleResend}
          disabled={resent}
          className="text-sm text-orange-600 hover:underline disabled:opacity-50"
        >
          {resent ? "Email sent!" : "Resend email"}
        </button>
      </Card>
    </div>
  );
}