"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle, MailCheck } from 'lucide-react';

function AuthActionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mode = searchParams.get('mode'); // 'resetPassword' or 'verifyEmail'
    const oobCode = searchParams.get('oobCode');

    // State for Password Reset
    const [status, setStatus] = useState<'loading' | 'input' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // --- LOGIC: Handle Different Modes ---
    useEffect(() => {
        const handleAction = async () => {
            // FIX: Check code inside the async function to avoid synchronous state update warning
            if (!oobCode) {
                setStatus('error');
                setErrorMessage("Invalid link. Code is missing.");
                return;
            }

            try {
                if (mode === 'verifyEmail') {
                    // *** MODE 1: VERIFY EMAIL ***
                    await applyActionCode(auth, oobCode);
                    setStatus('success');
                } else if (mode === 'resetPassword') {
                    // *** MODE 2: RESET PASSWORD (Check code validity first) ***
                    await verifyPasswordResetCode(auth, oobCode);
                    setStatus('input'); // Show input form
                } else {
                    setStatus('error');
                    setErrorMessage("Unknown action mode.");
                }
            } catch (error: unknown) {
                setStatus('error');
                const msg = error instanceof Error ? error.message : "Operation failed. The link may have expired.";
                setErrorMessage(msg);
            }
        };

        handleAction();
    }, [mode, oobCode]);

    // --- HANDLER: Password Reset Submit ---
    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode || newPassword.length < 6) return;

        setStatus('loading');
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setStatus('success');
        } catch (error: unknown) {
            setStatus('error');
            const msg = error instanceof Error ? error.message : "Failed to reset password.";
            setErrorMessage(msg);
        }
    };

    // --- RENDER: Based on Status & Mode ---
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                <p className="text-gray-500">Processing...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h2 className="text-xl font-bold">Error</h2>
                <p className="text-gray-600">{errorMessage}</p>
                <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                    Back to Login
                </Button>
            </div>
        );
    }

    if (status === 'success') {
        // Different success messages for different modes
        const isVerify = mode === 'verifyEmail';
        return (
            <div className="text-center space-y-4">
                {isVerify ? (
                    <MailCheck className="w-12 h-12 text-green-500 mx-auto" />
                ) : (
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                )}
                
                <h2 className="text-xl font-bold">
                    {isVerify ? "Email Verified!" : "Password Reset!"}
                </h2>
                
                <p className="text-gray-600">
                    {isVerify 
                        ? "Your email has been successfully verified." 
                        : "You can now use your new password to log in."}
                </p>
                
                <Button onClick={() => router.push('/login')} className="w-full">
                    Go to Login
                </Button>
            </div>
        );
    }

    // Status is 'input' (Only for Reset Password)
    return (
        <form onSubmit={handleResetSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Set New Password</h2>
                <p className="text-sm text-gray-500">Enter your new secure password below.</p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                />
            </div>
            
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                Reset Password
            </Button>
        </form>
    );
}

export default function AuthActionPage() {
    return (
        // FIX: Updated class name to bg-linear-to-br
        <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-xl flex flex-col items-center">
                <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin text-orange-600" />}>
                    <AuthActionContent />
                </Suspense>
            </Card>
        </div>
    );
}