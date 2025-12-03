"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const oobCode = searchParams.get('oobCode');
    
    // Initialize state
    const [status, setStatus] = useState<'loading' | 'input' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        // Wrap everything in an async function to satisfy the linter
        const verifyCode = async () => {
            if (!oobCode) {
                setStatus('error');
                setErrorMessage("Password reset code is missing.");
                return;
            }

            try {
                await verifyPasswordResetCode(auth, oobCode);
                setStatus('input');
            } catch (error: unknown) {
                setStatus('error');
                setErrorMessage("The password reset link is invalid or has expired.");
                console.error("Verification error:", error);
            }
        };

        verifyCode();
    }, [oobCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode || newPassword.length < 6) return;

        setStatus('loading');
        try {
            // 2. Confirm the password reset
            await confirmPasswordReset(auth, oobCode, newPassword);
            setStatus('success');
        } catch (error: unknown) {
            setStatus('error');
            const msg = error instanceof Error ? error.message : "Failed to reset password.";
            setErrorMessage(msg);
        }
    };

    switch (status) {
        case 'loading':
            return <Loader2 className="w-6 h-6 animate-spin text-orange-600" />;
        case 'input':
            return (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-bold">Set New Password</h2>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new secure password"
                            required
                            minLength={6}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Reset Password
                    </Button>
                </form>
            );
        case 'success':
            return (
                <div className="text-center space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <h2 className="text-xl font-bold">Password Reset Successful!</h2>
                    <p className="text-gray-600">You can now use your new password to log in.</p>
                    <Button onClick={() => window.location.href = '/login'} className="w-full">
                        Go to Login
                    </Button>
                </div>
            );
        case 'error':
            return (
                <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold">Error</h2>
                    <p className="text-gray-600">{errorMessage}</p>
                    <Button onClick={() => window.location.href = '/login'} variant="outline" className="w-full">
                        Go to Login
                    </Button>
                </div>
            );
    }
}

export default function ResetPasswordPage() {
    return (
        // Updated class name based on linter suggestion
        <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-xl flex flex-col items-center">
                <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin text-orange-600" />}>
                    <ResetPasswordContent />
                </Suspense>
            </Card>
        </div>
    );
}