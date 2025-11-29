// We no longer import Prisma here, making this file client-safe.

// Define the shape of our log data
interface LogData {
  userId?: string | null;
  action: string;
  details?: Record<string, unknown>;
  success?: boolean;
}

/**
 * Sends a log event to the server-side API route for secure storage in NeonDB.
 * This function is safe to call from both Client Components (via fetch) and Server Components.
 */
export async function logAction({ userId, action, details, success = true }: LogData) {
  try {
    // Log to the console immediately for local debugging
    console.log(`[AUDIT] User: ${userId || 'SYSTEM'} | Action: ${action} | Success: ${success}`);

    // Send the log event to the server
    await fetch("/api/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, action, details, success }),
    });

  } catch (error) {
    // If the network request to the API route fails, log it here.
    console.error("CRITICAL: Network failure sending log to API.", error);
  }
}