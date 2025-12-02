import { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  LogOut,
  User,
  Home,
  Calendar,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HouseSelector } from "./HouseSelector";
import { MembersList } from "./MembersList";
import { AddTaskDialog } from "./AddTaskDialog";
import { AddMemberDialog } from "./AddMemberDialog";
import { AddHouseDialog } from "./AddHouseDialog";
import { AlertDropdown } from "./AlertDropdown";
import { House, Member, Task, Alert } from "@/app/page";
import { EditTaskDialog } from "./EditTaskDialog";

interface HouseholdManagerProps {
  houses: House[];
  members: Member[];
  tasks: Task[];
  alerts: Alert[];
  selectedHouseId: string | null;
  userName: string;
  onSelectHouse: (id: string) => void;
  onAddHouse: (name: string) => void;
  onDeleteHouse: (id: string) => void;
  onAddMember: (houseId: string, email: string, role?: string) => Promise<void>;
  onDeleteMember: (id: string) => void;
  onAddTask: (
    houseId: string,
    title: string,
    description: string,
    assignedTo: string,
    deadline: Date
  ) => void;
  onToggleTask: (id: string, currentStatus: boolean) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onAlertClick: (id: string) => void;
}

export function HouseholdManager({
  houses,
  members,
  tasks,
  alerts,
  selectedHouseId,
  userName,
  onSelectHouse,
  onAddHouse,
  onDeleteHouse,
  onAddMember,
  onDeleteMember,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onLogout,
  onProfileClick,
  onAlertClick,
}: HouseholdManagerProps) {
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // 1. Filter Tasks Logic (Active vs Done)
  const currentHouseTasks = tasks.filter((t) => t.houseId === selectedHouseId);
  const activeTasks = currentHouseTasks.filter((t) => !t.completed);
  const completedTasks = currentHouseTasks.filter((t) => t.completed);

  // Get members for current house
  const currentHouseMembers = members.filter(
    (m) => m.houseId === selectedHouseId
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Home className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, {userName}
            </h1>
            <p className="text-gray-500 text-sm">Manage your household tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AlertDropdown alerts={alerts} onAlertClick={onAlertClick} />
          <Button
            variant="outline"
            onClick={onProfileClick}
            className="gap-2 bg-white"
          >
            <User className="w-4 h-4" />
            Profile
          </Button>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Houses & Members */}
        <div className="lg:col-span-4 space-y-6">
          <HouseSelector
            houses={houses}
            selectedHouseId={selectedHouseId}
            onSelectHouse={onSelectHouse}
            onAddHouse={() => setShowAddHouse(true)}
            onDeleteHouse={onDeleteHouse}
            alerts={alerts}
            onProfileClick={onProfileClick}
            onAlertClick={onAlertClick}
          />

          {selectedHouseId && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 font-semibold">
                  <User className="w-5 h-5 text-orange-600" />
                  Members
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddMember(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <MembersList
                members={currentHouseMembers}
                onDeleteMember={onDeleteMember}
              />
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Tasks */}
        <div className="lg:col-span-8">
          {selectedHouseId ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                <Button onClick={() => setShowAddTask(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Task
                </Button>
              </div>

              {/* ACTIVE TASKS SECTION */}
              <div className="space-y-3">
                {activeTasks.length === 0 ? (
                  <Card className="p-8 text-center border-dashed bg-white/50">
                    <p className="text-gray-500">
                      No active tasks. Enjoy your day!
                    </p>
                  </Card>
                ) : (
                  activeTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      onToggle={() => onToggleTask(task.id, task.completed)}
                      onDelete={() => onDeleteTask(task.id)}
                      onEdit={() => setTaskToEdit(task)}
                    />
                  ))
                )}
              </div>

              {/* COMPLETED TASKS BLOCK */}
              {completedTasks.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Task Done
                  </h3>
                  <div className="space-y-3 opacity-75">
                    {completedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        members={members}
                        onToggle={() => onToggleTask(task.id, task.completed)}
                        onDelete={() => onDeleteTask(task.id)}
                        onEdit={() => setTaskToEdit(task)}
                        isCompleted={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- FIX: Added Create Button to Empty State --- */
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/50 border-dashed">
              <div className="p-4 bg-orange-100 rounded-full mb-4">
                <Home className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No House Selected
              </h3>
              {/* FIXED: Escaped apostrophe ' to &apos; */}
              <p className="text-gray-500 max-w-sm mt-2 mb-6">
                You don&apos;t have any households yet. Create one to start
                managing your tasks!
              </p>
              <Button
                onClick={() => setShowAddHouse(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Household
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* DIALOGS */}
      <AddHouseDialog
        open={showAddHouse}
        onOpenChange={setShowAddHouse}
        onAddHouse={onAddHouse}
      />

      {selectedHouseId && (
        <>
          <AddMemberDialog
            open={showAddMember}
            onOpenChange={setShowAddMember}
            onAddMember={(email, role) =>
              onAddMember(selectedHouseId, email, role)
            }
          />
          <AddTaskDialog
            open={showAddTask}
            onOpenChange={setShowAddTask}
            members={currentHouseMembers}
            onAddTask={(title, description, assignedTo, deadline) =>
              onAddTask(
                selectedHouseId,
                title,
                description,
                assignedTo,
                deadline
              )
            }
          />
        </>
      )}

      {taskToEdit && (
        <EditTaskDialog
          open={!!taskToEdit} // Open if taskToEdit is not null
          onOpenChange={(open) => {
            if (!open) setTaskToEdit(null); // Close by clearing the state
          }}
          task={taskToEdit}
          members={currentHouseMembers}
          onUpdate={(updates) => {
            onUpdateTask(taskToEdit.id, updates);
            setTaskToEdit(null); // Close dialog on successful update
          }}
        />
      )}
    </div>
  );
}

// --- Helper Component for individual tasks ---

interface TaskCardProps {
  task: Task;
  members: Member[];
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isCompleted?: boolean;
}

function TaskCard({
  task,
  members,
  onToggle,
  onDelete,
  onEdit,
  isCompleted = false,
}: TaskCardProps) {
  const assigneeName =
    members.find((m: Member) => m.id === task.assignedTo)?.name || "Unassigned";
  const date = new Date(task.deadline).toLocaleDateString();

  return (
    <Card
      className={`p-4 transition-all hover:shadow-md ${
        isCompleted
          ? "bg-gray-50 border-gray-200"
          : "bg-white border-orange-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          aria-label={
            isCompleted ? "Mark task as incomplete" : "Mark task as complete"
          }
          title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          className={`mt-1 shrink-0 transition-colors ${
            isCompleted
              ? "text-green-600"
              : "text-gray-300 hover:text-orange-500"
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium ${
              isCompleted ? "text-gray-500 line-through" : "text-gray-900"
            }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
              <User className="w-3 h-3" />
              {assigneeName}
            </span>
            <span
              className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                isCompleted ? "bg-gray-100" : "bg-orange-50 text-orange-700"
              }`}
            >
              <Calendar className="w-3 h-3" />
              {date}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          {!isCompleted && (
            <button
              onClick={onEdit}
              aria-label="Edit task"
              title="Edit task"
              className="text-gray-400 hover:text-orange-500 p-1"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {/* <button
            onClick={onDelete}
            aria-label="Delete task"
            title="Delete task"
            className="text-gray-400 hover:text-red-500 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button> */}
        </div>
      </div>
    </Card>
  );
}
