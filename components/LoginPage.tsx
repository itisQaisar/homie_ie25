"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Home, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Please verify your email address first.");
        await signOut(auth); // Prevent login if not verified
        return;
      }

      // Success - redirect to dashboard or home
      router.push("/"); 
    } catch (err: unknown) {
      // We log the error to satisfy the linter and for debugging
      console.error("Login failed", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: unknown) {
      // We log the error to satisfy the linter and for debugging
      console.error("Google sign-in failed", err);
      setError("Google sign in failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Home className="w-10 h-10 text-orange-600" />
            <h1 className="text-3xl font-bold">Homie</h1>
          </div>
          <p className="text-gray-600">Sign in to manage your household tasks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
             <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
               <AlertCircle className="w-4 h-4" /> {error}
             </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">No account? </span>
          <button onClick={() => router.push("/signup")} className="text-orange-600 hover:underline">
            Sign up
          </button>
        </div>
      </Card>
    </div>
  );
}