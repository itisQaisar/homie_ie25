"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Ensure you have created this file
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Ensure you have created this file
import { HouseholdManager } from "@/components/HouseholdManager";
import { ProfilePage } from "@/components/ProfilePage";
import { Loader2 } from "lucide-react";

// --- Interfaces ---
export interface House {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Member {
  id: string;
  houseId: string;
  name: string;
  role?: string;
}

export interface Task {
  id: string;
  houseId: string;
  title: string;
  description?: string;
  assignedTo: string; // member id
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
  // 1. Get Global Auth State
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentView, setCurrentView] = useState<"dashboard" | "profile">("dashboard");
  
  // 2. Local Data State
  // NOTE: These currently reset on refresh. 
  // The next step in development would be to replace these useStates with Firestore hooks.
  const [houses, setHouses] = useState<House[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);

  // 3. Protect the Route: Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect is handled by the useEffect above once user becomes null
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // 4. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  // 5. Guard Clause: Don't render dashboard if no user
  if (!user) return null;

  // --- Logic Functions ---

  const addHouse = (name: string) => {
    const newHouse: House = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    };
    setHouses([...houses, newHouse]);
    if (!selectedHouseId) {
      setSelectedHouseId(newHouse.id);
    }
  };

  const deleteHouse = (id: string) => {
    setHouses(houses.filter((h) => h.id !== id));
    setMembers(members.filter((m) => m.houseId !== id));
    setTasks(tasks.filter((t) => t.houseId !== id));
    if (selectedHouseId === id) {
      setSelectedHouseId(houses[0]?.id || null);
    }
  };

  const addMember = (houseId: string, name: string, role?: string) => {
    const newMember: Member = {
      id: crypto.randomUUID(),
      houseId,
      name,
      role,
    };
    setMembers([...members, newMember]);

    const houseName = houses.find((h) => h.id === houseId)?.name || "household";
    addAlert("New Member Added", `${name} has been added to ${houseName}.`);
  };

  const deleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    setTasks(
      tasks.map((t) => (t.assignedTo === id ? { ...t, assignedTo: "" } : t))
    );
  };

  const addTask = (
    houseId: string,
    title: string,
    description: string,
    assignedTo: string,
    deadline: Date
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      houseId,
      title,
      description,
      assignedTo,
      deadline,
      completed: false,
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTaskCompletion = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      const member = members.find((m) => m.id === task.assignedTo);
      addAlert(
        "Task Completed",
        `"${task.title}" has been marked as complete${
          member ? ` by ${member.name}` : ""
        }.`
      );
    }
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date() : undefined,
            }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const addAlert = (title: string, message: string) => {
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      title,
      message,
      seen: false,
      createdAt: new Date(),
    };
    setAlerts([...alerts, newAlert]);
  };

  const markAlertAsSeen = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, seen: true } : a)));
  };

  const leaveHousehold = () => {
    if (selectedHouseId) {
      setSelectedHouseId(null);
      addAlert("Left Household", `You have left the household.`);
    }
    setCurrentView("dashboard");
  };

  const getTasksCompletedToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter((task) => {
      if (!task.completed || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {currentView === "dashboard" ? (
        <HouseholdManager
          houses={houses}
          members={members}
          tasks={tasks}
          alerts={alerts}
          selectedHouseId={selectedHouseId}
          // Map Firebase User to component props
          userName={user.displayName || user.email?.split('@')[0] || "User"}
          onSelectHouse={setSelectedHouseId}
          onAddHouse={addHouse}
          onDeleteHouse={deleteHouse}
          onAddMember={addMember}
          onDeleteMember={deleteMember}
          onAddTask={addTask}
          onToggleTask={toggleTaskCompletion}
          onDeleteTask={deleteTask}
          onUpdateTask={updateTask}
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