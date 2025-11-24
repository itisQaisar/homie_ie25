"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import { HouseholdManager } from "@/components/HouseholdManager";
import { ProfilePage } from "@/components/ProfilePage";
import { Loader2 } from "lucide-react";

// --- Types ---

interface ApiMember {
  id: string;
  houseId: string;
  userId: string;
  role: string;
  user?: {
    name?: string | null;
    email: string;
  } | null;
}

export interface House {
  id: string;
  name: string;
  createdAt: Date;
  ownerId: string;
  members?: ApiMember[]; 
}

export interface Member {
  id: string;
  houseId: string;
  userId: string;
  name?: string;
  role?: string;
}

export interface Task {
  id: string;
  houseId: string;
  title: string;
  description?: string;
  assignedTo: string;
  deadline: Date;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  seen: boolean;
  createdAt: Date;
}

export default function App() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<"dashboard" | "profile">("dashboard");
  
  // --- State ---
  const [houses, setHouses] = useState<House[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // --- Helper: Safe Fetch ---
  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error(`🚨 API Error at ${url}: Expected JSON but got ${contentType}`);
        console.error("Response Body (HTML Preview):", text.slice(0, 200)); 
        throw new Error(`Server returned ${res.status} ${res.statusText} (Not JSON)`);
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Request failed with status ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`❌ Fetch Failed for ${url}`, error);
      throw error;
    }
  };

  // --- 1. Auth Protection ---
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // --- Data Fetching Wrappers ---

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const data = await safeFetch(`/api/houses?userId=${user.uid}`);
      setHouses(data);
      
      if (data.length > 0) {
        setSelectedHouseId((prev) => prev || data[0].id);
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  const fetchHouseDetails = useCallback(async (houseId: string) => {
    try {
      const data = await safeFetch(`/api/tasks?houseId=${houseId}`);
      setTasks(data);

      const currentHouse = houses.find(h => h.id === houseId);
      
      if (currentHouse && Array.isArray(currentHouse.members)) {
        const rawMembers = currentHouse.members;
        
        const formattedMembers: Member[] = rawMembers.map((m) => ({
          id: m.id,
          houseId: m.houseId,
          userId: m.userId,
          name: m.user?.name || m.user?.email || "Unknown",
          role: m.role
        }));
        setMembers(formattedMembers);
      }

    } catch (e) {
      console.error("Error in fetchHouseDetails:", e);
    }
  }, [houses]);

  // --- 2. Effects to Trigger Fetches ---
  
  useEffect(() => {
    if (user?.uid) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    if (selectedHouseId) {
      fetchHouseDetails(selectedHouseId);
    }
  }, [selectedHouseId, fetchHouseDetails]);

  // --- Actions (API Calls) ---

  const addHouse = async (name: string) => {
    if (!user) return;
    try {
      const newHouse = await safeFetch("/api/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId: user.uid })
      });
      
      setHouses(prev => [...prev, newHouse]);
      setSelectedHouseId(newHouse.id);
      addAlert("Success", `Household "${name}" created.`);
    } catch (error: unknown) {
      // Fix: Use 'unknown' and check type or cast safely
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to create household.";
      addAlert("Error", message);
    }
  };

  const addMember = async (houseId: string, email: string, role: string = "member") => {
    try {
      await safeFetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseId, email, role })
      });
      
      fetchUserData(); 
      addAlert("Success", "Member added successfully.");
    } catch (error: unknown) {
      // Fix: Use 'unknown' and check type
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to add member";
      alert(message);
    }
  };

  const addTask = async (
    houseId: string,
    title: string,
    description: string,
    assignedTo: string,
    deadline: Date
  ) => {
    try {
      await safeFetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, houseId, assignedTo, deadline })
      });
      
      fetchHouseDetails(houseId);
      addAlert("Task Created", `"${title}" added.`);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTaskCompletion = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic Update
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));

      await safeFetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !currentStatus })
      });
      
      if (!currentStatus) {
         addAlert("Task Done", "Task marked as completed!");
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      fetchHouseDetails(selectedHouseId!); 
    }
  };

  const deleteHouse = (id: string) => {
    setHouses(houses.filter(h => h.id !== id));
    if (selectedHouseId === id) setSelectedHouseId(null);
  };

  const deleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const deleteTask = async (id: string) => {
    try {
      await safeFetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (e) { 
      console.error("Error deleting task:", e);
    }
  };

  const onUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  // --- Helper Logic ---
  const addAlert = (title: string, message: string) => {
    const newAlert: Alert = { id: crypto.randomUUID(), title, message, seen: false, createdAt: new Date() };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const markAlertAsSeen = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, seen: true } : a)));
  };

  const getTasksCompletedToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter((task) => {
      if (!task.completed || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return new Date(completedDate).setHours(0,0,0,0) === today.getTime();
    });
  };

  const leaveHousehold = () => {
    setSelectedHouseId(null);
    setCurrentView("dashboard");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {dataLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-orange-100 z-50">
          <div className="h-full bg-orange-500 animate-pulse"></div>
        </div>
      )}

      {currentView === "dashboard" ? (
        <HouseholdManager
          houses={houses}
          members={members}
          tasks={tasks}
          alerts={alerts}
          selectedHouseId={selectedHouseId}
          userName={user.displayName || user.email?.split('@')[0] || "User"}
          onSelectHouse={setSelectedHouseId}
          onAddHouse={addHouse}
          onDeleteHouse={deleteHouse}
          onAddMember={addMember}
          onDeleteMember={deleteMember}
          onAddTask={addTask}
          onToggleTask={toggleTaskCompletion}
          onDeleteTask={deleteTask}
          onUpdateTask={onUpdateTask}
          onLogout={handleLogout}
          onProfileClick={() => setCurrentView("profile")}
          onAlertClick={markAlertAsSeen}
        />
      ) : (
        <ProfilePage
          userName={user.displayName || user.email?.split('@')[0] || "User"}
          userEmail={user.email || ""}
          currentHouseName={houses.find((h) => h.id === selectedHouseId)?.name}
          tasksCompletedToday={getTasksCompletedToday()}
          members={members}
          onBack={() => setCurrentView("dashboard")}
          onLogout={handleLogout}
          onLeaveHousehold={leaveHousehold}
        />
      )}
    </div>
  );
}