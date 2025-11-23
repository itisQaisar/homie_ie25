import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowLeft, LogOut, UserMinus, CheckCircle2 } from "lucide-react";
import type { Task, Member } from "@/app/page";

interface ProfilePageProps {
  userName: string;
  userEmail: string;
  currentHouseName?: string;
  tasksCompletedToday: Task[];
  members: Member[];
  onBack: () => void;
  onLogout: () => void;
  onLeaveHousehold: () => void;
}

export function ProfilePage({
  userName,
  userEmail,
  currentHouseName,
  tasksCompletedToday,
  members,
  onBack,
  onLogout,
  onLeaveHousehold,
}: ProfilePageProps) {
  // Get member names for tasks
  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-orange-600 hover:bg-orange-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          {/* Profile Info Card */}
          <Card className="p-6">
            <h2 className="mb-6">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="text-lg">{userName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="text-lg">{userEmail}</p>
              </div>
              {currentHouseName && (
                <div>
                  <label className="text-sm text-gray-600">
                    Current Household
                  </label>
                  <p className="text-lg">{currentHouseName}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Daily Report Card */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
              Daily Report
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Tasks you completed today
            </p>
            {tasksCompletedToday.length > 0 ? (
              <div className="space-y-3">
                {tasksCompletedToday.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {task.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned to: {getMemberName(task.assignedTo)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-gray-600 mt-4">
                  Total tasks completed today: {tasksCompletedToday.length}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No tasks completed today yet</p>
              </div>
            )}
          </Card>

          {/* Actions Card */}
          <Card className="p-6">
            <h2 className="mb-4">Actions</h2>
            <div className="space-y-3">
              {currentHouseName && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-orange-300 text-orange-600 hover:bg-orange-50"
                  onClick={onLeaveHousehold}
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Leave Household ({currentHouseName})
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
