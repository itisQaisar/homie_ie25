"use client";
import { HouseholdManager } from "@/components/HouseholdManager";
import { LoginPage } from "@/components/LoginPage";
import { ProfilePage } from "@/components/ProfilePage";
import { SignupPage } from "@/components/SignupPage";
import { useState } from "react";

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
  completedAt?: Date; // Track when task was completed
  createdAt: Date;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  seen: boolean;
  createdAt: Date;
}

interface User {
  name: string;
  email: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [currentView, setCurrentView] = useState<"dashboard" | "profile">(
    "dashboard"
  );
  const [houses, setHouses] = useState<House[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);

  // Authentication handlers
  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleSignup = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthView("login");
  };

  // If not logged in, show authentication pages
  if (!user) {
    if (authView === "signup") {
      return (
        <SignupPage
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthView("login")}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => setAuthView("signup")}
      />
    );
  }

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

    // Create an alert for new member
    const houseName = houses.find((h) => h.id === houseId)?.name || "household";
    addAlert("New Member Added", `${name} has been added to ${houseName}.`);
  };

  const deleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    // Optionally unassign tasks from this member
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
      // Task is being completed, create an alert
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

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const leaveHousehold = () => {
    if (selectedHouseId) {
      setSelectedHouseId(null);
      // Create an alert
      addAlert("Left Household", `You have left the household.`);
    }
    setCurrentView("dashboard");
  };

  // Get tasks completed today
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

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50">
      {currentView === "dashboard" ? (
        <HouseholdManager
          houses={houses}
          members={members}
          tasks={tasks}
          alerts={alerts}
          selectedHouseId={selectedHouseId}
          userName={user.name}
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
          userName={user.name}
          userEmail={user.email}
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
